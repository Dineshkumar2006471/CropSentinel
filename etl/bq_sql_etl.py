from google.cloud import bigquery

PROJECT_ID = "fasalsetu-501307"
DATASET_ID = "mandi_data"

def run_sql_etl():
    client = bigquery.Client(project=PROJECT_ID)
    
    query = f"""
    DROP TABLE IF EXISTS `{PROJECT_ID}.{DATASET_ID}.agg_risk_score`;
    CREATE TABLE `{PROJECT_ID}.{DATASET_ID}.agg_risk_score`
    PARTITION BY date
    CLUSTER BY commodity_id, mandi_id AS
    WITH DailyPrices AS (
        SELECT 
            mandi_id,
            commodity_id,
            date,
            modal_price AS avg_price,
            AVG(modal_price) OVER(
                PARTITION BY mandi_id, commodity_id 
                ORDER BY UNIX_DATE(date) 
                RANGE BETWEEN 6 PRECEDING AND CURRENT ROW
            ) AS ma_7d,
            AVG(modal_price) OVER(
                PARTITION BY mandi_id, commodity_id 
                ORDER BY UNIX_DATE(date) 
                RANGE BETWEEN 29 PRECEDING AND CURRENT ROW
            ) AS ma_30d,
            STDDEV(modal_price) OVER(
                PARTITION BY mandi_id, commodity_id 
                ORDER BY UNIX_DATE(date) 
                RANGE BETWEEN 29 PRECEDING AND CURRENT ROW
            ) AS volatility_30d
        FROM `{PROJECT_ID}.{DATASET_ID}.fact_mandi_price`
    )
    SELECT 
        mandi_id,
        commodity_id,
        date,
        avg_price,
        ma_7d,
        ma_30d,
        COALESCE(volatility_30d, 0) AS volatility_30d,
        CASE 
            WHEN ma_30d > 0 THEN (COALESCE(volatility_30d, 0) / ma_30d) * 100
            ELSE 0 
        END AS risk_score
    FROM DailyPrices;
    """
    
    print("Running BigQuery SQL ETL (Fallback due to PySpark Quota/Winutils issues)...")
    job = client.query(query)
    job.result()  # Wait for it to finish
    print(f"Successfully populated {DATASET_ID}.agg_risk_score using BigQuery SQL!")

if __name__ == "__main__":
    run_sql_etl()
