import csv
from pathlib import Path
from data_gov_pull import generate_mandi_id, generate_commodity_id
import load_dimensions

INPUT_CSV = Path("data/raw/historical_mandi_prices.csv")

def main():
    print("Collecting dimensions...")
    mandis = {}
    commodities = {}
    
    with open(INPUT_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            state = str(row.get("State", "")).strip().title()
            district = str(row.get("District", "")).strip().title()
            market = str(row.get("Market", "")).strip().title()
            commodity = str(row.get("Commodity", "")).strip().title()
            
            if not state or not market or not commodity:
                continue
                
            mid = generate_mandi_id(state, district, market)
            if mid not in mandis:
                mandis[mid] = {
                    "mandi_id": mid,
                    "name": market,
                    "state": state,
                    "district": district,
                    "lat": None,
                    "lon": None
                }
                
            cid = generate_commodity_id(commodity)
            if cid not in commodities:
                commodities[cid] = {
                    "commodity_id": cid,
                    "name": commodity,
                    "category": "Vegetable" # Defaulting to Vegetable for our 3 targets
                }
                
    m_list = list(mandis.values())
    c_list = list(commodities.values())
    
    print(f"Found {len(m_list)} unique mandis and {len(c_list)} unique commodities.")
    print("Upserting to BigQuery dimension tables...")
    
    load_dimensions.load_mandis_to_bigquery(m_list)
    load_dimensions.load_commodities_to_bigquery(c_list)
    print("Dimensions loaded successfully.")

if __name__ == "__main__":
    main()
