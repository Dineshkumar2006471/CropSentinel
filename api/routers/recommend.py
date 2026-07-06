from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class RecommendRequest(BaseModel):
    crop_name: str
    quantity_quintals: float
    lat: float
    lon: float

@router.post("/")
def recommend(request: RecommendRequest):
    """
    Given a farmer's location, crop, and quantity, 
    recommend the best mandi to sell at by adjusting forecast prices by transit distance.
    """
    # TODO: Implement geocoding and distance logic based on Phase 4 spec.
    # For now, return a mock recommendation to allow UI wiring.
    return {
        "recommended_action": "RELOCATE",
        "best_mandi_id": "M_123",
        "best_mandi_name": "Warangal Main",
        "expected_price_quintal": 2800.0,
        "transit_cost_est": 450.0,
        "net_profit_est": (2800.0 * request.quantity_quintals) - 450.0,
        "reason": "Warangal has a 12% higher forecasted price for Tomato over the next 3 days, offsetting the 45km transit cost."
    }
