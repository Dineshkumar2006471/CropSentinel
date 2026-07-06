import os
from google.cloud import bigquery

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "fasalsetu-501307")
DATASET_ID = "mandi_data"

client = bigquery.Client(project=PROJECT_ID)

def get_forecasts(mandi_id: str, commodity_id: str):
    query = f"""
        SELECT
            forecast_date,
            horizon_days,
            predicted_price,
            confidence_low,
            confidence_high,
            model_version
        FROM `{PROJECT_ID}.{DATASET_ID}.fact_forecast`
        WHERE mandi_id = @mandi_id AND commodity_id = @commodity_id
        ORDER BY forecast_date
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("mandi_id", "STRING", mandi_id),
            bigquery.ScalarQueryParameter("commodity_id", "STRING", commodity_id),
        ]
    )
    df = client.query(query, job_config=job_config).to_dataframe()
    return df.to_dict(orient="records")

def get_risk_scores(mandi_id: str, commodity_id: str):
    query = f"""
        SELECT date, avg_price, ma_7d, ma_30d, volatility_30d, risk_score
        FROM `{PROJECT_ID}.{DATASET_ID}.agg_risk_score`
        WHERE mandi_id = @mandi_id AND commodity_id = @commodity_id
        ORDER BY date
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("mandi_id", "STRING", mandi_id),
            bigquery.ScalarQueryParameter("commodity_id", "STRING", commodity_id),
        ]
    )
    df = client.query(query, job_config=job_config).to_dataframe()
    # Convert dates/timestamps to string for JSON serialization
    if not df.empty:
        df["date"] = df["date"].astype(str)
    return df.to_dict(orient="records")

def get_mandis():
    query = f"""
        SELECT mandi_id, name, state, district, lat, lon
        FROM `{PROJECT_ID}.{DATASET_ID}.dim_mandi`
    """
    return client.query(query).to_dataframe().to_dict(orient="records")

def get_commodities():
    query = f"""
        SELECT commodity_id, name, category, unit
        FROM `{PROJECT_ID}.{DATASET_ID}.dim_commodity`
    """
    return client.query(query).to_dataframe().to_dict(orient="records")
