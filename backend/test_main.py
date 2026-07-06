import pytest
from unittest.mock import patch, MagicMock
import pandas as pd
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
import main
from main import app, load_data

client = TestClient(app)

@pytest.fixture
def mock_bq():
    with patch('google.cloud.bigquery.Client') as MockClient:
        mock_instance = MockClient.return_value
        
        def mock_query(query):
            mock_job = MagicMock()
            if "fact_mandi_price" in query:
                # If the query contains a JOIN with dim_mandi, we return names, otherwise IDs
                if "JOIN" in query.upper() and "DIM_MANDI" in query.upper():
                    df = pd.DataFrame({
                        'mandi_id': [1, 2],
                        'commodity_id': ['tomato', 'onion'],
                        'mandi_name': ['Warangal', 'Pune'],
                        'crop_name': ['Tomato', 'Onion'],
                        'district': ['Dist A', 'Dist B'],
                        'date': ['2026-07-06', '2026-07-06'],
                        'modal_price': [1000, 2000],
                        'min_price': [900, 1800],
                        'max_price': [1100, 2200]
                    })
                else:
                    # Broken query returns just IDs
                    df = pd.DataFrame({
                        'mandi_id': [1, 2],
                        'commodity_id': ['tomato', 'onion'],
                        'date': ['2026-07-06', '2026-07-06'],
                        'modal_price': [1000, 2000],
                        'min_price': [900, 1800],
                        'max_price': [1100, 2200],
                        'mandi_name': ['1', '2'], # Fallback to ID
                        'crop_name': ['tomato', 'onion'],
                        'district': [None, None]
                    })
                mock_job.to_dataframe.return_value = df
            elif "fact_forecast" in query:
                df = pd.DataFrame({
                    'mandi_id': [1, 2],
                    'commodity_id': ['tomato', 'onion'],
                    'predicted_price': [1200, 1500],
                    'forecast_date': pd.to_datetime(['2026-07-06', '2020-01-01']),
                    'data_freshness': ['Recent', 'Stale']
                })
                mock_job.to_dataframe.return_value = df
            elif "agg_risk_score" in query:
                df = pd.DataFrame({
                    'mandi_id': [1, 2],
                    'commodity_id': ['tomato', 'onion'],
                    'risk_score': [10.0, 45.0],
                    'date': pd.to_datetime(['2026-07-06', '2026-07-06'])
                })
                mock_job.to_dataframe.return_value = df
            else:
                mock_job.to_dataframe.return_value = pd.DataFrame()
                
            return mock_job
            
        mock_instance.query = mock_query
        yield mock_instance

def test_mandi_name_join(mock_bq):
    load_data()
    assert not main.df.empty
    numeric_markets = main.df[main.df['Market'].astype(str).str.isnumeric()]
    assert len(numeric_markets) == 0, f"Bug caught: Mandi JOIN failed, returned raw IDs: {numeric_markets['Market'].tolist()}"

def test_recommend_endpoint_sell(mock_bq):
    load_data()
    res = client.get("/api/recommend?commodity=onion")
    assert res.status_code == 200
    data = res.json()
    assert data['action'] == 'sell'
    assert data['risk_score'] == 45.0
    assert data['trend_pct'] == -25.0

def test_recommend_endpoint_hold(mock_bq):
    load_data()
    res = client.get("/api/recommend?commodity=tomato")
    assert res.status_code == 200
    data = res.json()
    assert data['action'] == 'hold'
    assert data['trend_pct'] == 20.0

def test_forecast_data_freshness(mock_bq):
    load_data()
    res_tomato = client.get("/api/recommend?commodity=tomato")
    assert res_tomato.json()['data_freshness'] == 'Recent'
    
    res_onion = client.get("/api/recommend?commodity=onion")
    assert res_onion.json()['data_freshness'] == 'Stale'
