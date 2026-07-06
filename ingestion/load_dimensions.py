"""
FasalSetu — Dimension Table Loader

Loads dim_mandi and dim_commodity tables from data collected during ingestion.
Can also be run standalone to rebuild dimensions from fact_mandi_price data.

Usage:
  python load_dimensions.py
  python load_dimensions.py --from-json mandis.json commodities.json
"""

import argparse
import json

from google.cloud import bigquery

import config


def load_mandis_to_bigquery(mandis: list[dict]) -> int:
    """Load unique mandi records into dim_mandi (upsert via MERGE).

    Args:
        mandis: List of mandi dicts with keys: mandi_id, name, state, district, lat, lon

    Returns:
        Number of mandis loaded/updated
    """
    if not mandis:
        return 0

    client = bigquery.Client(project=config.GCP_PROJECT_ID)

    # Use MERGE to upsert — don't duplicate if mandi already exists
    # First, load to a temp table, then merge
    temp_table = f"{config.GCP_PROJECT_ID}.{config.BQ_DATASET}._temp_mandis"

    # Create temp table and load
    job_config = bigquery.LoadJobConfig(
        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
        schema=[
            bigquery.SchemaField("mandi_id", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("name", "STRING"),
            bigquery.SchemaField("state", "STRING"),
            bigquery.SchemaField("district", "STRING"),
            bigquery.SchemaField("lat", "FLOAT64"),
            bigquery.SchemaField("lon", "FLOAT64"),
        ],
    )

    job = client.load_table_from_json(mandis, temp_table, job_config=job_config)
    job.result()

    # Merge into dim_mandi
    merge_query = f"""
        MERGE `{config.BQ_DIM_MANDI}` AS target
        USING `{temp_table}` AS source
        ON target.mandi_id = source.mandi_id
        WHEN NOT MATCHED THEN
            INSERT (mandi_id, name, state, district, lat, lon)
            VALUES (source.mandi_id, source.name, source.state, source.district,
                    source.lat, source.lon)
        WHEN MATCHED AND (target.name IS NULL OR target.state IS NULL) THEN
            UPDATE SET
                name = COALESCE(target.name, source.name),
                state = COALESCE(target.state, source.state),
                district = COALESCE(target.district, source.district)
    """
    client.query(merge_query).result()

    # Clean up temp table
    client.delete_table(temp_table, not_found_ok=True)

    return len(mandis)


def load_commodities_to_bigquery(commodities: list[dict]) -> int:
    """Load unique commodity records into dim_commodity (upsert via MERGE).

    Args:
        commodities: List of commodity dicts with keys: commodity_id, name, category, unit

    Returns:
        Number of commodities loaded/updated
    """
    if not commodities:
        return 0

    client = bigquery.Client(project=config.GCP_PROJECT_ID)

    temp_table = f"{config.GCP_PROJECT_ID}.{config.BQ_DATASET}._temp_commodities"

    job_config = bigquery.LoadJobConfig(
        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
        schema=[
            bigquery.SchemaField("commodity_id", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("name", "STRING"),
            bigquery.SchemaField("category", "STRING"),
            bigquery.SchemaField("unit", "STRING"),
        ],
    )

    job = client.load_table_from_json(commodities, temp_table, job_config=job_config)
    job.result()

    merge_query = f"""
        MERGE `{config.BQ_DIM_COMMODITY}` AS target
        USING `{temp_table}` AS source
        ON target.commodity_id = source.commodity_id
        WHEN NOT MATCHED THEN
            INSERT (commodity_id, name, category, unit)
            VALUES (source.commodity_id, source.name, source.category, source.unit)
    """
    client.query(merge_query).result()

    client.delete_table(temp_table, not_found_ok=True)

    return len(commodities)


def rebuild_from_fact_table():
    """Rebuild dimension tables by scanning fact_mandi_price for unique mandis/commodities.

    This is a fallback if dimensions weren't collected during ingestion.
    Note: This won't have market names or district info — only IDs.
    """
    client = bigquery.Client(project=config.GCP_PROJECT_ID)

    print("  Rebuilding dim_commodity from fact_mandi_price...")
    query = f"""
        INSERT INTO `{config.BQ_DIM_COMMODITY}` (commodity_id, name, category, unit)
        SELECT DISTINCT
            commodity_id,
            commodity_id AS name,  -- Best we can do without the raw data
            'Unknown' AS category,
            'quintal' AS unit
        FROM `{config.BQ_FACT_MANDI_PRICE}`
        WHERE commodity_id NOT IN (
            SELECT commodity_id FROM `{config.BQ_DIM_COMMODITY}`
        )
    """
    result = client.query(query).result()
    print(f"  ✅ dim_commodity updated")

    print("  Rebuilding dim_mandi from fact_mandi_price...")
    query = f"""
        INSERT INTO `{config.BQ_DIM_MANDI}` (mandi_id)
        SELECT DISTINCT mandi_id
        FROM `{config.BQ_FACT_MANDI_PRICE}`
        WHERE mandi_id NOT IN (
            SELECT mandi_id FROM `{config.BQ_DIM_MANDI}`
        )
    """
    result = client.query(query).result()
    print(f"  ✅ dim_mandi updated")


def run_from_json(mandis_file: str, commodities_file: str):
    """Load dimensions from JSON files (output of data_gov_pull.py)."""
    with open(mandis_file) as f:
        mandis = json.load(f)
    with open(commodities_file) as f:
        commodities = json.load(f)

    print(f"  Loading {len(mandis)} mandis...")
    loaded = load_mandis_to_bigquery(mandis)
    print(f"  ✅ {loaded} mandis loaded")

    print(f"  Loading {len(commodities)} commodities...")
    loaded = load_commodities_to_bigquery(commodities)
    print(f"  ✅ {loaded} commodities loaded")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FasalSetu — Dimension Table Loader")
    parser.add_argument("--from-json", nargs=2, metavar=("MANDIS", "COMMODITIES"),
                        help="Load from JSON files")
    parser.add_argument("--rebuild", action="store_true",
                        help="Rebuild dimensions from fact_mandi_price")

    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  FasalSetu — Dimension Table Loader")
    print(f"{'='*60}\n")

    if args.from_json:
        run_from_json(args.from_json[0], args.from_json[1])
    elif args.rebuild:
        rebuild_from_fact_table()
    else:
        print("  Use --from-json or --rebuild. Run with -h for help.")
