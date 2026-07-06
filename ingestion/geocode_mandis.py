"""
FasalSetu — Mandi Geocoding

Geocodes mandi locations using Google Maps Geocoding API.
Reads unique mandis from BigQuery dim_mandi table (with null lat/lon),
geocodes them, and updates the table.

Usage:
  python geocode_mandis.py
"""

import time

import googlemaps
from google.cloud import bigquery
from tqdm import tqdm

import config


def get_ungecoded_mandis() -> list[dict]:
    """Fetch mandis from BigQuery that don't have lat/lon yet."""
    client = bigquery.Client(project=config.GCP_PROJECT_ID)

    query = f"""
        SELECT mandi_id, name, state, district
        FROM `{config.BQ_DIM_MANDI}`
        WHERE lat IS NULL OR lon IS NULL
    """
    rows = client.query(query).result()
    return [dict(row) for row in rows]


def geocode_mandi(gmaps: googlemaps.Client, name: str, district: str,
                  state: str) -> tuple[float | None, float | None]:
    """Geocode a single mandi using Google Maps.

    Constructs a search query like "Kalwakurthy APMC, Mahbubnagar, Telangana, India"
    to get the most accurate result.

    Returns:
        (lat, lon) tuple, or (None, None) if geocoding fails
    """
    # Build search query — more specific = better results
    search_query = f"{name}, {district}, {state}, India"

    try:
        results = gmaps.geocode(search_query)
        if results:
            location = results[0]["geometry"]["location"]
            return location["lat"], location["lng"]

        # Fallback: try just district + state
        fallback_query = f"{district} mandi, {state}, India"
        results = gmaps.geocode(fallback_query)
        if results:
            location = results[0]["geometry"]["location"]
            return location["lat"], location["lng"]

    except Exception as e:
        print(f"  [WARN] Geocoding error for {name}: {e}")

    return None, None


def update_mandi_coordinates(mandi_id: str, lat: float, lon: float):
    """Update a single mandi's coordinates in BigQuery using DML."""
    client = bigquery.Client(project=config.GCP_PROJECT_ID)

    query = f"""
        UPDATE `{config.BQ_DIM_MANDI}`
        SET lat = {lat}, lon = {lon}
        WHERE mandi_id = '{mandi_id}'
    """
    client.query(query).result()


def run_geocoding():
    """Main geocoding workflow."""
    print(f"\n{'='*60}")
    print(f"  FasalSetu — Mandi Geocoding")
    print(f"{'='*60}\n")

    # Initialize Google Maps client
    gmaps = googlemaps.Client(key=config.GOOGLE_MAPS_API_KEY)

    # Get mandis that need geocoding
    mandis = get_ungecoded_mandis()
    print(f"  Found {len(mandis)} mandis to geocode\n")

    if not mandis:
        print("  ✅ All mandis already geocoded!")
        return

    geocoded = 0
    failed = 0

    for mandi in tqdm(mandis, desc="Geocoding", unit="mandi"):
        lat, lon = geocode_mandi(
            gmaps,
            mandi["name"],
            mandi["district"],
            mandi["state"]
        )

        if lat is not None and lon is not None:
            update_mandi_coordinates(mandi["mandi_id"], lat, lon)
            geocoded += 1
        else:
            failed += 1
            tqdm.write(f"  ⚠ Failed: {mandi['name']} ({mandi['district']}, {mandi['state']})")

        # Rate limit: Google Maps allows 50 QPS but be conservative
        time.sleep(0.1)

    print(f"\n  ✅ Geocoded: {geocoded}")
    print(f"  ⚠ Failed: {failed}")
    print(f"  Total mandis in dim_mandi: {geocoded + failed}")


if __name__ == "__main__":
    run_geocoding()
