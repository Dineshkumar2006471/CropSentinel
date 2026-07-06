from google.cloud import bigquery
import pandas as pd
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 1000)

client = bigquery.Client(project='fasalsetu-501307')
try:
    print(client.query('SELECT * FROM `fasalsetu-501307.mandi_data.agg_risk_score` LIMIT 5').to_dataframe())
except Exception as e:
    print(f"Error querying agg_risk_score: {e}")
