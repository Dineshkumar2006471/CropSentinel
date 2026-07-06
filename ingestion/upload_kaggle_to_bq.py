import csv
import json
from pathlib import Path
from datetime import datetime

from data_gov_pull import upload_to_gcs, load_to_bigquery, generate_mandi_id, generate_commodity_id

INPUT_CSV = Path("data/raw/historical_mandi_prices.csv")

def main():
    print("Loading CSV into memory...")
    records = []
    
    with open(INPUT_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Parse prices
            try:
                min_p = float(row.get("Min_Price", 0) or 0)
                max_p = float(row.get("Max_Price", 0) or 0)
                modal_p = float(row.get("Modal_Price", 0) or 0)
            except ValueError:
                continue
                
            # Parse date
            try:
                date_str = row.get("Arrival_Date", "")
                if "-" in date_str:
                    d = datetime.strptime(date_str, "%Y-%m-%d")
                else:
                    d = datetime.strptime(date_str, "%d/%m/%Y")
                iso_date = d.strftime("%Y-%m-%d")
            except Exception:
                continue
                
            state = str(row.get("State", "")).strip().title()
            district = str(row.get("District", "")).strip().title()
            market = str(row.get("Market", "")).strip().title()
            commodity = str(row.get("Commodity", "")).strip().title()
                
            record = {
                "mandi_id": generate_mandi_id(state, district, market),
                "commodity_id": generate_commodity_id(commodity),
                "date": iso_date,
                "min_price": min_p,
                "max_price": max_p,
                "modal_price": modal_p,
                "arrival_qty": None,
                "_state": state,
                "_district": district,
                "_market": market,
                "_commodity": commodity,
                "_variety": str(row.get("Variety", "")).strip(),
                "_grade": str(row.get("Grade", "")).strip()
            }
            records.append(record)
            
    print(f"Loaded {len(records)} valid records.")
    
    records.sort(key=lambda x: x["date"])
    
    today_iso = datetime.now().strftime("%Y-%m-%d")
    
    print("\nUploading to GCS...")
    gcs_uri = upload_to_gcs(records, f"{today_iso}_kaggle")
    print(f"Uploaded to {gcs_uri}")
    
    print("\nLoading to BigQuery...")
    rows_loaded = load_to_bigquery(records)
    print(f"Success! {rows_loaded} rows loaded into BigQuery.")
    
if __name__ == "__main__":
    main()
