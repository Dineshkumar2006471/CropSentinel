from fastapi import APIRouter
from services.bigquery_client import get_mandis, get_commodities

router = APIRouter()

@router.get("/mandis")
def get_all_mandis():
    return get_mandis()

@router.get("/commodities")
def get_all_commodities():
    return get_commodities()
