from fastapi import APIRouter
from services.bigquery_client import get_risk_scores

router = APIRouter()

@router.get("/{mandi_id}/{commodity_id}")
def get_risk(mandi_id: str, commodity_id: str):
    """Fetch historical prices and volatility/risk scores."""
    return get_risk_scores(mandi_id, commodity_id)
