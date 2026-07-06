"""
FasalSetu — Project Configuration

Central config loaded from .env file. All modules import from here.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

# ── API Keys ──────────────────────────────────────────────────────────────────
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# ── GCP ───────────────────────────────────────────────────────────────────────
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "fasalsetu-501307")
GCS_BUCKET = os.getenv("GCS_BUCKET", "fasalsetu-501307-data")
BQ_DATASET = os.getenv("BQ_DATASET", "mandi_data")
GCP_REGION = os.getenv("GCP_REGION", "asia-south1")

# ── Data.gov.in API ───────────────────────────────────────────────────────────
DATA_GOV_BASE_URL = "https://api.data.gov.in/resource"
DATA_GOV_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
DATA_GOV_API_URL = f"{DATA_GOV_BASE_URL}/{DATA_GOV_RESOURCE_ID}"

# ── Scope (hackathon prototype) ──────────────────────────────────────────────
TARGET_STATES = ["Telangana", "Maharashtra", "Rajasthan"]
TARGET_COMMODITIES = ["Tomato", "Onion", "Potato"]

# ── GCS Paths ─────────────────────────────────────────────────────────────────
GCS_RAW_PREFIX = f"gs://{GCS_BUCKET}/raw/agmarknet"
GCS_CURATED_PREFIX = f"gs://{GCS_BUCKET}/curated/prices"
GCS_MODELS_PREFIX = f"gs://{GCS_BUCKET}/models"

# ── BigQuery table references ─────────────────────────────────────────────────
BQ_FACT_MANDI_PRICE = f"{GCP_PROJECT_ID}.{BQ_DATASET}.fact_mandi_price"
BQ_FACT_FORECAST = f"{GCP_PROJECT_ID}.{BQ_DATASET}.fact_forecast"
BQ_AGG_RISK_SCORE = f"{GCP_PROJECT_ID}.{BQ_DATASET}.agg_risk_score"
BQ_DIM_MANDI = f"{GCP_PROJECT_ID}.{BQ_DATASET}.dim_mandi"
BQ_DIM_COMMODITY = f"{GCP_PROJECT_ID}.{BQ_DATASET}.dim_commodity"

# ── API rate limits ───────────────────────────────────────────────────────────
DATA_GOV_PAGE_SIZE = 1000        # max records per API call
DATA_GOV_RATE_LIMIT_DELAY = 0.5  # seconds between API calls (be polite)
