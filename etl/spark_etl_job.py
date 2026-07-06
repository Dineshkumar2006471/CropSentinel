"""
FasalSetu — PySpark ETL Job (Phase 2)

Reads raw daily prices from BigQuery `fact_mandi_price`.
Computes 7-day, 30-day moving averages and price volatility.
Writes aggregated results to BigQuery `agg_risk_score`.

Run Locally:
    python etl/spark_etl_job.py

Run on Dataproc Serverless:
    gcloud dataproc batches submit pyspark etl/spark_etl_job.py \
        --batch=fasalsetu-etl-batch \
        --region=us-central1 \
        --deps-packages=google-cloud-bigquery
"""

import os
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Make sure you set your GCP Project ID here
PROJECT_ID = "fasalsetu-501307"
DATASET_ID = "mandi_data"
GCS_BUCKET = f"gs://{PROJECT_ID}-data"

def main():
    print("[START] Starting FasalSetu Spark ETL Job...")
    
    # Initialize Spark Session with BigQuery connector
    spark = SparkSession.builder \
        .appName("FasalSetu_ETL") \
        .config("spark.jars.packages", "com.google.cloud.spark:spark-bigquery-with-dependencies_2.12:0.34.0") \
        .getOrCreate()
        
    spark.conf.set("viewsEnabled", "true")
    spark.conf.set("materializationDataset", DATASET_ID)

    # 1. Read Raw Data from BigQuery
    print(f"[READ] Reading data from {PROJECT_ID}.{DATASET_ID}.fact_mandi_price...")
    try:
        df_prices = spark.read.format("bigquery") \
            .option("table", f"{PROJECT_ID}.{DATASET_ID}.fact_mandi_price") \
            .load()
    except Exception as e:
        print(f"[ERROR] Failed to read from BigQuery. Are you running locally without ADC? Error: {e}")
        return

    # 2. Data Cleaning & Transformation
    print("[PROCESS] Cleaning data and computing aggregations...")
    
    # Define a window partitioned by mandi & commodity, ordered by date
    # RangeBetween uses days (assuming 'date' is castable to unix timestamp / seconds / days)
    # Actually, simpler is to just use rowsBetween for consecutive days if we assume daily data, 
    # but RangeBetween is safer for missing days. We'll convert date to timestamp to use rangeBetween.
    
    # Cast date to unix timestamp in seconds for range window
    df_prices = df_prices.withColumn("date_ts", F.unix_timestamp("date"))
    days_to_sec = lambda d: d * 24 * 60 * 60
    
    window_7d = Window.partitionBy("mandi_id", "commodity_id") \
                      .orderBy("date_ts") \
                      .rangeBetween(-days_to_sec(7), 0)
                      
    window_30d = Window.partitionBy("mandi_id", "commodity_id") \
                       .orderBy("date_ts") \
                       .rangeBetween(-days_to_sec(30), 0)

    # Compute Moving Averages and Volatility (StdDev)
    df_agg = df_prices.withColumn("ma_7d", F.avg("modal_price").over(window_7d)) \
                      .withColumn("ma_30d", F.avg("modal_price").over(window_30d)) \
                      .withColumn("volatility_30d", F.stddev("modal_price").over(window_30d))
                      
    # Calculate simple "Risk Score" (0-100) based on volatility relative to moving average
    # High volatility = high risk. Risk = (volatility / ma_30d) * 100
    df_agg = df_agg.withColumn(
        "risk_score", 
        F.when(F.col("ma_30d") > 0, (F.col("volatility_30d") / F.col("ma_30d")) * 100).otherwise(0)
    )
    
    # Select only required columns for agg_risk_score
    df_final = df_agg.select(
        "mandi_id",
        "commodity_id",
        "date",
        F.col("modal_price").alias("avg_price"),
        "ma_7d",
        "ma_30d",
        "volatility_30d",
        "risk_score"
    )

    # 3. Write Back to BigQuery
    print(f"[WRITE] Writing aggregated results to {PROJECT_ID}.{DATASET_ID}.agg_risk_score...")
    
    # Save to BQ using temporary GCS bucket for the load job
    df_final.write.format("bigquery") \
        .option("table", f"{PROJECT_ID}.{DATASET_ID}.agg_risk_score") \
        .option("temporaryGcsBucket", f"{PROJECT_ID}-data/spark_temp") \
        .mode("overwrite") \
        .save()
        
    print("[DONE] ETL Job Completed Successfully!")

if __name__ == "__main__":
    main()
