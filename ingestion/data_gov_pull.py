"""
FasalSetu  --  Data.gov.in Mandi Price Ingestion

Pulls daily commodity price data from the data.gov.in Agmarknet API.
Supports:
  - Historical backfill (loop over a date range)
  - Daily incremental pull (today's data)
  - Loads to both Cloud Storage (raw JSON) and BigQuery (fact_mandi_price)

Usage:
  # Backfill last 12 months
  python data_gov_pull.py --backfill --months 12

  # Pull today's data only
  python data_gov_pull.py --today

  # Pull a specific date range
  python data_gov_pull.py --start 2025-07-01 --end 2026-07-03
"""

import argparse
import json
import time
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

import requests
from tqdm import tqdm
from google.cloud import storage, bigquery

import config


def fetch_page(state: str, commodity: str, date_str: str, offset: int = 0, max_retries: int = 4) -> dict:
    """Fetch a single page of results from the API with exponential backoff."""
    params = {
        "api-key": config.DATA_GOV_API_KEY,
        "format": "json",
        "filters[state.keyword]": state,
        "filters[commodity]": commodity,
        "filters[arrival_date]": date_str,
        "offset": offset,
        "limit": config.DATA_GOV_PAGE_SIZE,
    }

    for attempt in range(max_retries):
        try:
            resp = requests.get(config.DATA_GOV_API_URL, params=params, timeout=30)
            resp.raise_for_status()
            return resp.json()
        except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError, requests.exceptions.HTTPError) as e:
            if attempt < max_retries - 1:
                wait = 2 ** (attempt + 1)  # 2s, 4s, 8s
                time.sleep(wait)
            else:
                raise


def fetch_all_records(state: str, commodity: str, date_str: str) -> list[dict]:
    """Fetch all paginated records for a (state, commodity, date) combination.

    Returns:
        List of record dicts from the API
    """
    all_records = []
    offset = 0

    while True:
        data = fetch_page(state, commodity, date_str, offset)
        records = data.get("records", [])
        total = int(data.get("total", 0))

        if not records:
            break

        all_records.extend(records)

        if len(all_records) >= total:
            break

        offset += config.DATA_GOV_PAGE_SIZE
        time.sleep(config.DATA_GOV_RATE_LIMIT_DELAY)

    return all_records


def generate_mandi_id(state: str, district: str, market: str) -> str:
    """Generate a stable mandi_id from state + district + market name.

    Uses a short hash to avoid issues with special characters in market names.
    """
    raw = f"{state.strip().lower()}|{district.strip().lower()}|{market.strip().lower()}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def generate_commodity_id(commodity: str) -> str:
    """Generate a stable commodity_id from commodity name."""
    return commodity.strip().lower().replace(" ", "_")


def normalize_record(record: dict) -> dict:
    """Normalize a raw API record into our schema.

    Handles:
      - Date format conversion (DD/MM/YYYY -> YYYY-MM-DD)
      - Price type coercion (str -> float)
      - mandi_id and commodity_id generation
    """
    # Parse date: API returns "DD/MM/YYYY"
    raw_date = record.get("arrival_date", "")
    try:
        parsed_date = datetime.strptime(raw_date, "%d/%m/%Y")
        iso_date = parsed_date.strftime("%Y-%m-%d")
    except ValueError:
        iso_date = None

    # Parse prices (API sometimes returns strings)
    def safe_float(val):
        try:
            return float(val) if val is not None else None
        except (ValueError, TypeError):
            return None

    state = record.get("state", "").strip()
    district = record.get("district", "").strip()
    market = record.get("market", "").strip()
    commodity = record.get("commodity", "").strip()

    return {
        "mandi_id": generate_mandi_id(state, district, market),
        "commodity_id": generate_commodity_id(commodity),
        "date": iso_date,
        "min_price": safe_float(record.get("min_price")),
        "max_price": safe_float(record.get("max_price")),
        "modal_price": safe_float(record.get("modal_price")),
        "arrival_qty": None,  # Not in data.gov.in API  --  will come from CEDA/e-NAM later
        # Keep raw fields for dimension tables
        "_state": state,
        "_district": district,
        "_market": market,
        "_commodity": commodity,
        "_variety": record.get("variety", "").strip(),
        "_grade": record.get("grade", "").strip(),
    }


def upload_to_gcs(records: list[dict], date_str_iso: str) -> str:
    """Upload raw records as NDJSON to Cloud Storage.

    Args:
        records: List of normalized record dicts
        date_str_iso: Date in YYYY-MM-DD format

    Returns:
        GCS URI of the uploaded file
    """
    client = storage.Client(project=config.GCP_PROJECT_ID)
    bucket = client.bucket(config.GCS_BUCKET)

    blob_path = f"raw/agmarknet/date={date_str_iso}/prices.jsonl"
    blob = bucket.blob(blob_path)

    ndjson = "\n".join(json.dumps(r, ensure_ascii=False) for r in records)
    blob.upload_from_string(ndjson, content_type="application/json")

    gcs_uri = f"gs://{config.GCS_BUCKET}/{blob_path}"
    return gcs_uri


def load_to_bigquery(records: list[dict]) -> int:
    """Load normalized records into BigQuery fact_mandi_price table.

    Only loads the columns that match the BQ schema (excludes _prefixed raw fields).

    Returns:
        Number of rows loaded
    """
    client = bigquery.Client(project=config.GCP_PROJECT_ID)

    # Filter to only schema-matching columns
    bq_columns = ["mandi_id", "commodity_id", "date", "min_price", "max_price",
                   "modal_price", "arrival_qty"]
    bq_records = [
        {k: v for k, v in r.items() if k in bq_columns and r.get("date")}
        for r in records
    ]

    if not bq_records:
        return 0

    job_config = bigquery.LoadJobConfig(
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
        schema=[
            bigquery.SchemaField("mandi_id", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("commodity_id", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("date", "DATE", mode="REQUIRED"),
            bigquery.SchemaField("min_price", "FLOAT64"),
            bigquery.SchemaField("max_price", "FLOAT64"),
            bigquery.SchemaField("modal_price", "FLOAT64"),
            bigquery.SchemaField("arrival_qty", "FLOAT64"),
        ],
    )

    job = client.load_table_from_json(
        bq_records, config.BQ_FACT_MANDI_PRICE, job_config=job_config
    )
    job.result()  # Wait for completion

    return len(bq_records)


def collect_dimensions(records: list[dict]) -> tuple[list[dict], list[dict]]:
    """Extract unique mandis and commodities from records for dimension tables.

    Returns:
        (mandi_dims, commodity_dims)  --  lists of unique dimension records
    """
    mandis = {}
    commodities = {}

    for r in records:
        mid = r["mandi_id"]
        if mid not in mandis:
            mandis[mid] = {
                "mandi_id": mid,
                "name": r["_market"],
                "state": r["_state"],
                "district": r["_district"],
                "lat": None,  # Filled in by geocode_mandis.py
                "lon": None,
            }

        cid = r["commodity_id"]
        if cid not in commodities:
            commodities[cid] = {
                "commodity_id": cid,
                "name": r["_commodity"],
                "category": categorize_commodity(r["_commodity"]),
                "unit": "quintal",  # Agmarknet prices are per quintal
            }

    return list(mandis.values()), list(commodities.values())


def categorize_commodity(name: str) -> str:
    """Simple commodity categorization for the dimension table."""
    vegetables = ["tomato", "onion", "potato", "brinjal", "cauliflower",
                   "cabbage", "green chilli", "lady finger", "peas"]
    fruits = ["apple", "banana", "mango", "grapes", "orange", "papaya"]
    cereals = ["rice", "wheat", "maize", "jowar", "bajra", "ragi"]
    pulses = ["tur", "urad", "moong", "chana", "masur"]

    lower = name.lower()
    if any(v in lower for v in vegetables):
        return "Vegetables"
    elif any(f in lower for f in fruits):
        return "Fruits"
    elif any(c in lower for c in cereals):
        return "Cereals"
    elif any(p in lower for p in pulses):
        return "Pulses"
    else:
        return "Other"


def run_backfill(months: int = 12):
    """Pull historical data for the configured states and commodities.

    Args:
        months: How many months of history to pull (default: 12)
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=months * 30)

    print(f"\n{'='*70}")
    print(f"  FasalSetu  --  Historical Backfill")
    print(f"  Range: {start_date.strftime('%Y-%m-%d')} -> {end_date.strftime('%Y-%m-%d')}")
    print(f"  States: {', '.join(config.TARGET_STATES)}")
    print(f"  Commodities: {', '.join(config.TARGET_COMMODITIES)}")
    print(f"{'='*70}\n")

    # Generate all dates in range
    dates = []
    current = start_date
    while current <= end_date:
        dates.append(current)
        current += timedelta(days=1)

    all_records = []
    all_mandis = {}
    all_commodities = {}
    total_api_calls = 0
    failed_calls = 0

    # Progress bar over dates
    for date in tqdm(dates, desc="Pulling dates", unit="day"):
        date_str_api = date.strftime("%d/%m/%Y")  # API format
        date_str_iso = date.strftime("%Y-%m-%d")   # Our format
        day_records = []

        for state in config.TARGET_STATES:
            for commodity in config.TARGET_COMMODITIES:
                try:
                    records = fetch_all_records(state, commodity, date_str_api)
                    total_api_calls += 1

                    normalized = [normalize_record(r) for r in records]
                    day_records.extend(normalized)

                    time.sleep(config.DATA_GOV_RATE_LIMIT_DELAY)

                except requests.RequestException as e:
                    failed_calls += 1
                    tqdm.write(f"  [WARN] API error for {state}/{commodity}/{date_str_iso}: {e}")
                    continue

        if day_records:
            # Upload to GCS
            try:
                gcs_uri = upload_to_gcs(day_records, date_str_iso)
            except Exception as e:
                tqdm.write(f"  [WARN] GCS upload failed for {date_str_iso}: {e}")

            # Collect dimensions
            mandis, commodities = collect_dimensions(day_records)
            for m in mandis:
                all_mandis[m["mandi_id"]] = m
            for c in commodities:
                all_commodities[c["commodity_id"]] = c

            all_records.extend(day_records)

        # Batch load to BigQuery every 30 days to avoid memory issues
        if len(all_records) >= 50000:
            tqdm.write(f"  [LOAD] Loading {len(all_records)} records to BigQuery...")
            rows_loaded = load_to_bigquery(all_records)
            tqdm.write(f"  [OK] Loaded {rows_loaded} rows")
            all_records = []

    # Load remaining records
    if all_records:
        print(f"\n📦 Loading final {len(all_records)} records to BigQuery...")
        rows_loaded = load_to_bigquery(all_records)
        print(f"[OK] Loaded {rows_loaded} rows")

    # Summary
    print(f"\n{'='*70}")
    print(f"  Backfill Complete!")
    print(f"  API calls made: {total_api_calls}")
    print(f"  Failed calls: {failed_calls}")
    print(f"  Unique mandis found: {len(all_mandis)}")
    print(f"  Unique commodities: {len(all_commodities)}")
    print(f"{'='*70}\n")

    return list(all_mandis.values()), list(all_commodities.values())


def run_daily():
    """Pull today's data for configured states and commodities."""
    today = datetime.now()
    date_str_api = today.strftime("%d/%m/%Y")
    date_str_iso = today.strftime("%Y-%m-%d")

    print(f"\n  FasalSetu  --  Daily Pull for {date_str_iso}")

    all_records = []
    for state in config.TARGET_STATES:
        for commodity in config.TARGET_COMMODITIES:
            try:
                records = fetch_all_records(state, commodity, date_str_api)
                normalized = [normalize_record(r) for r in records]
                all_records.extend(normalized)
                print(f"  [OK] {state}/{commodity}: {len(records)} records")
                time.sleep(config.DATA_GOV_RATE_LIMIT_DELAY)
            except requests.RequestException as e:
                print(f"  [WARN] {state}/{commodity}: API error  --  {e}")

    if all_records:
        gcs_uri = upload_to_gcs(all_records, date_str_iso)
        print(f"  [FILE] GCS: {gcs_uri}")

        rows = load_to_bigquery(all_records)
        print(f"  [BQ] BigQuery: {rows} rows loaded")
    else:
        print("  [WARN] No records found for today from API.")


def run_date_range(start: str, end: str):
    """Pull data for a specific date range.

    Args:
        start: Start date as YYYY-MM-DD
        end: End date as YYYY-MM-DD
    """
    start_date = datetime.strptime(start, "%Y-%m-%d")
    end_date = datetime.strptime(end, "%Y-%m-%d")

    days = (end_date - start_date).days + 1
    months_approx = days / 30

    print(f"\n  Pulling {days} days of data ({start} -> {end})")

    # Reuse backfill logic by temporarily adjusting dates
    dates = []
    current = start_date
    while current <= end_date:
        dates.append(current)
        current += timedelta(days=1)

    all_records = []
    for date in tqdm(dates, desc="Pulling dates", unit="day"):
        date_str_api = date.strftime("%d/%m/%Y")
        date_str_iso = date.strftime("%Y-%m-%d")
        day_records = []

        for state in config.TARGET_STATES:
            for commodity in config.TARGET_COMMODITIES:
                try:
                    records = fetch_all_records(state, commodity, date_str_api)
                    normalized = [normalize_record(r) for r in records]
                    day_records.extend(normalized)
                    time.sleep(config.DATA_GOV_RATE_LIMIT_DELAY)
                except requests.RequestException as e:
                    tqdm.write(f"  [WARN] {state}/{commodity}/{date_str_iso}: {e}")

        if day_records:
            try:
                upload_to_gcs(day_records, date_str_iso)
            except Exception as e:
                tqdm.write(f"  [WARN] GCS upload failed for {date_str_iso}: {e}")

            all_records.extend(day_records)

        # Batch load every 50k records
        if len(all_records) >= 50000:
            tqdm.write(f"  [LOAD] Loading {len(all_records)} records to BigQuery...")
            load_to_bigquery(all_records)
            all_records = []

    if all_records:
        print(f"\n📦 Loading final {len(all_records)} records to BigQuery...")
        rows = load_to_bigquery(all_records)
        print(f"[OK] Loaded {rows} rows")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FasalSetu  --  Mandi Price Data Ingestion")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--backfill", action="store_true",
                       help="Pull historical data (default: 12 months)")
    group.add_argument("--today", action="store_true",
                       help="Pull today's data only")
    group.add_argument("--start", type=str,
                       help="Start date (YYYY-MM-DD) for custom range")

    parser.add_argument("--months", type=int, default=12,
                        help="Months of history for backfill (default: 12)")
    parser.add_argument("--end", type=str,
                        help="End date (YYYY-MM-DD) for custom range")

    args = parser.parse_args()

    if args.backfill:
        run_backfill(months=args.months)
    elif args.today:
        run_daily()
    elif args.start:
        end = args.end or datetime.now().strftime("%Y-%m-%d")
        run_date_range(args.start, end)
