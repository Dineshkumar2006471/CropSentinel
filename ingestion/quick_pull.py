"""
FasalSetu -- Resilient Data Puller

A simpler, more resilient approach to pulling data from data.gov.in.
Pulls ALL current data (no date filter) which is much faster,
then saves to CSV files locally. These CSVs are then loaded to GCS/BigQuery.

This avoids the slow date-by-date historical API loop.
"""

import csv
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load .env
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

STATES = ["Telangana", "Maharashtra", "Rajasthan"]
COMMODITIES = ["Tomato", "Onion", "Potato"]

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"


def pull_data(state, commodity, max_retries=5):
    """Pull ALL current records for a state+commodity pair.

    No date filter = the API returns all available current data (usually last few days).
    Much faster than looping over dates.
    """
    all_records = []
    offset = 0
    page_size = 1000

    while True:
        params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": page_size,
            "offset": offset,
            "filters[state.keyword]": state,
            "filters[commodity]": commodity,
        }

        for attempt in range(max_retries):
            try:
                print(f"    Fetching offset={offset} (attempt {attempt+1})...", end=" ", flush=True)
                resp = requests.get(BASE_URL, params=params, timeout=120)
                resp.raise_for_status()
                data = resp.json()
                print(f"OK ({data.get('count', 0)} records)")
                break
            except requests.exceptions.RequestException as e:
                wait = min(2 ** (attempt + 1), 30)
                print(f"FAILED ({e.__class__.__name__}), retrying in {wait}s...")
                time.sleep(wait)
                if attempt == max_retries - 1:
                    print(f"    GIVING UP after {max_retries} retries: {e}")
                    return all_records

        records = data.get("records", [])
        total = int(data.get("total", 0))

        if not records:
            break

        all_records.extend(records)
        print(f"    Progress: {len(all_records)}/{total}")

        if len(all_records) >= total:
            break

        offset += page_size
        time.sleep(1)  # Be polite

    return all_records


def save_to_csv(records, state, commodity):
    """Save records to a CSV file."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    filename = f"{state.lower()}_{commodity.lower()}.csv"
    filepath = OUTPUT_DIR / filename

    if not records:
        print(f"  No records for {state}/{commodity}, skipping CSV")
        return None

    fieldnames = ["state", "district", "market", "commodity", "variety",
                  "grade", "arrival_date", "min_price", "max_price", "modal_price"]

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in records:
            writer.writerow({
                "state": r.get("state", ""),
                "district": r.get("district", ""),
                "market": r.get("market", ""),
                "commodity": r.get("commodity", ""),
                "variety": r.get("variety", ""),
                "grade": r.get("grade", ""),
                "arrival_date": r.get("arrival_date", ""),
                "min_price": r.get("min_price", ""),
                "max_price": r.get("max_price", ""),
                "modal_price": r.get("modal_price", ""),
            })

    print(f"  Saved {len(records)} records to {filepath}")
    return filepath


def main():
    print("=" * 60)
    print("  FasalSetu -- Data Pull (Resilient)")
    print("=" * 60)
    print()

    total_records = 0
    files_created = []

    for state in STATES:
        for commodity in COMMODITIES:
            print(f"\n  [{state}] [{commodity}]")
            records = pull_data(state, commodity)
            total_records += len(records)

            filepath = save_to_csv(records, state, commodity)
            if filepath:
                files_created.append(filepath)

    print()
    print("=" * 60)
    print(f"  DONE")
    print(f"  Total records pulled: {total_records}")
    print(f"  Files created: {len(files_created)}")
    for f in files_created:
        print(f"    - {f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
