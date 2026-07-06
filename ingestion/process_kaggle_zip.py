import csv
import zipfile
import sys
from pathlib import Path

# Config
ZIP_PATH = "daily-commodity-prices-india.zip"
OUTPUT_DIR = Path("data/raw")
TARGET_STATES = {"Telangana", "Maharashtra", "Rajasthan"}
TARGET_COMMODITIES = {"Tomato", "Onion", "Potato"}
# Extracting 2025 and 2026 data
TARGET_FILES = ["csv/2025.csv", "csv/2026.csv"]

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / "historical_mandi_prices.csv"
    
    print("Opening ZIP file...")
    try:
        with zipfile.ZipFile(ZIP_PATH, 'r') as z:
            available_files = z.namelist()
            
            count_in = 0
            count_out = 0
            
            with open(out_file, 'w', newline='', encoding='utf-8') as out_f:
                writer = None
                
                for csv_filename in TARGET_FILES:
                    if csv_filename not in available_files:
                        print(f"Warning: {csv_filename} not found in zip.")
                        continue
                        
                    print(f"Processing {csv_filename}...")
                    with z.open(csv_filename, 'r') as f:
                        import io
                        text_f = io.TextIOWrapper(f, encoding='utf-8', errors='replace')
                        reader = csv.DictReader(text_f)
                        
                        # Map column names
                        state_col = next((c for c in reader.fieldnames if 'state' in c.lower()), None)
                        comm_col = next((c for c in reader.fieldnames if 'commodity' in c.lower()), None)
                        
                        if writer is None:
                            writer = csv.DictWriter(out_f, fieldnames=reader.fieldnames)
                            writer.writeheader()
                            
                        for row in reader:
                            count_in += 1
                            if count_in % 1000000 == 0:
                                print(f"  Processed {count_in/1000000:.1f}M rows...")
                                
                            state = str(row.get(state_col, "")).title()
                            comm = str(row.get(comm_col, "")).title()
                            
                            if state in TARGET_STATES and comm in TARGET_COMMODITIES:
                                writer.writerow(row)
                                count_out += 1
                                
            print(f"Done! Evaluated {count_in} rows.")
            print(f"Filtered down to {count_out} records for our states/commodities.")
            print(f"Saved to: {out_file}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
