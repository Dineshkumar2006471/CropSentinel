from fastapi import APIRouter
from services.bigquery_client import get_forecasts

router = APIRouter()

@router.get("/{mandi_id}/{commodity_id}")
def get_forecast(mandi_id: str, commodity_id: str):
    """Fetch 7-day XGBoost forecast for a given mandi and commodity."""
    return get_forecasts(mandi_id, commodity_id)
