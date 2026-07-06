# %% [markdown]
# # FasalSetu — Phase 3: RAPIDS GPU Price Forecasting
#
# **Environment:** Google Colab with T4 GPU runtime.
#
# **Pipeline:**
# 1. Authenticate to GCP and read `agg_risk_score` from BigQuery
# 2. Engineer lag/time features on GPU via cuDF
# 3. Train an XGBoost regressor (GPU-accelerated) to predict 7-day-ahead prices
# 4. Evaluate with RMSE and MAE on a time-based holdout split
# 5. Generate forecasts for every (mandi, commodity) pair and write to `fact_forecast`
#
# **BigQuery `fact_forecast` schema (REQUIRED fields marked):**
# | Column           | Type    | Mode     |
# |------------------|---------|----------|
# | mandi_id         | STRING  | REQUIRED |
# | commodity_id     | STRING  | REQUIRED |
# | forecast_date    | DATE    | REQUIRED |
# | horizon_days     | INTEGER | REQUIRED |
# | predicted_price  | FLOAT   | NULLABLE |
# | confidence_low   | FLOAT   | NULLABLE |
# | confidence_high  | FLOAT   | NULLABLE |
# | model_version    | STRING  | NULLABLE |

# %% [markdown]
# ## 1. Install Dependencies & Authenticate

# %%
# Uncomment the lines below when running in a fresh Colab session:
# !pip install -q cudf-cu12 cuml-cu12 --extra-index-url=https://pypi.nvidia.com
# !pip install -q google-cloud-bigquery pandas pyarrow db-dtypes xgboost

import google.auth
credentials, project = google.auth.default()
print(f"[AUTH] Using Application Default Credentials (project: {project})")

# %% [markdown]
# ## 2. Import Libraries & Set Constants

# %%
try:
    import cudf  # type: ignore[import-not-found]
    HAS_CUDF = True
except ImportError:
    cudf = None
    HAS_CUDF = False
    print("[WARN] cudf not available — falling back to pandas (CPU mode).")
import xgboost as xgb
import pandas as pd
import numpy as np
from google.cloud import bigquery

PROJECT_ID = "fasalsetu-501307"
DATASET_ID = "mandi_data"
TABLE_FORECAST = f"{PROJECT_ID}.{DATASET_ID}.fact_forecast"
TABLE_RISK = f"{PROJECT_ID}.{DATASET_ID}.agg_risk_score"

HORIZON_DAYS = 7           # Forecast horizon
HOLDOUT_DAYS = 30          # Last N days reserved for test evaluation
MODEL_VERSION = "xgboost_gpu_v1"

FEATURES = [
    "mandi_code", "commodity_code",
    "month", "day_of_week",
    "avg_price", "ma_7d", "ma_30d",
    "volatility_30d", "risk_score",
]
TARGET = "target_price_7d"

client = bigquery.Client(project=PROJECT_ID)
print(f"[INIT] BigQuery client ready — project={PROJECT_ID}")

# %% [markdown]
# ## 3. Read Data from BigQuery (`agg_risk_score`)

# %%
print(f"[READ] Fetching data from {TABLE_RISK} ...")

query = f"""
    SELECT
        mandi_id,
        commodity_id,
        date,
        avg_price,
        ma_7d,
        ma_30d,
        COALESCE(volatility_30d, 0) AS volatility_30d,
        COALESCE(risk_score, 0)     AS risk_score
    FROM `{TABLE_RISK}`
    ORDER BY mandi_id, commodity_id, date
"""

df_pd = client.query(query).to_dataframe()
df_pd["date"] = pd.to_datetime(df_pd["date"])

# Validate: fail fast if no data
assert not df_pd.empty, "No rows returned from agg_risk_score — run ETL first!"

# Drop any remaining nulls in the price columns
df_pd.dropna(subset=["avg_price", "ma_7d", "ma_30d"], inplace=True)

# Transfer to GPU if available, otherwise stay on pandas
if HAS_CUDF:
    df = cudf.from_pandas(df_pd)
    print(f"[READ] Loaded {len(df):,} rows into GPU memory (cuDF).")
else:
    df = df_pd.copy()
    print(f"[READ] Loaded {len(df):,} rows into pandas (CPU mode).")
df.head()

# %% [markdown]
# ## 4. Feature Engineering

# %%
print("[FEAT] Engineering features ...")

# Sort chronologically per group
df = df.sort_values(by=["mandi_id", "commodity_id", "date"])

# Target: the price HORIZON_DAYS into the future (shift backwards)
df["target_price_7d"] = (
    df.groupby(["mandi_id", "commodity_id"])["avg_price"]
      .shift(-HORIZON_DAYS)
)

# Drop rows where target is NaN (last HORIZON_DAYS rows per group)
df = df.dropna(subset=[TARGET])

# Calendar features
df["month"]       = df["date"].dt.month
df["day_of_week"] = df["date"].dt.weekday

# Encode categorical IDs as integer codes for XGBoost
df["mandi_code"]     = df["mandi_id"].astype("category").cat.codes
df["commodity_code"] = df["commodity_id"].astype("category").cat.codes

print(f"[FEAT] {len(df):,} training-eligible rows | {len(FEATURES)} features.")

# %% [markdown]
# ## 5. Train/Test Split & GPU XGBoost

# %%
print("[TRAIN] Training XGBoost on GPU ...")

# Time-based split: last HOLDOUT_DAYS days = test set
max_date = df["date"].max()
# cudf Timestamp → pandas Timestamp for arithmetic
if HAS_CUDF:
    cutoff = pd.Timestamp(max_date.values_host[0]) - pd.Timedelta(days=HOLDOUT_DAYS)
else:
    cutoff = pd.Timestamp(max_date) - pd.Timedelta(days=HOLDOUT_DAYS)

train_mask = df["date"] <= np.datetime64(cutoff)
test_mask  = df["date"] >  np.datetime64(cutoff)

X_train, y_train = df.loc[train_mask, FEATURES], df.loc[train_mask, TARGET]
X_test,  y_test  = df.loc[test_mask,  FEATURES], df.loc[test_mask,  TARGET]

print(f"  Train rows: {len(X_train):,}  |  Test rows: {len(X_test):,}")

dtrain = xgb.DMatrix(X_train, label=y_train)
dtest  = xgb.DMatrix(X_test,  label=y_test)

params = {
    "tree_method":   "hist",
    "device":        "cuda" if HAS_CUDF else "cpu",
    "objective":     "reg:squarederror",
    "eval_metric":   "rmse",
    "max_depth":     8,
    "learning_rate": 0.05,
    "subsample":     0.8,
    "colsample_bytree": 0.8,
    "min_child_weight": 5,
    "reg_alpha":     0.1,
    "reg_lambda":    1.0,
}

model = xgb.train(
    params,
    dtrain,
    num_boost_round=300,
    evals=[(dtrain, "train"), (dtest, "test")],
    early_stopping_rounds=20,
    verbose_eval=25,
)
print("[TRAIN] Model trained successfully on GPU.")

# Quick evaluation
y_pred_test = model.predict(dtest)
y_true_np   = y_test.to_pandas().values if hasattr(y_test, "to_pandas") else np.array(y_test)
y_pred_np   = y_pred_test.get() if hasattr(y_pred_test, "get") else y_pred_test

rmse = np.sqrt(np.mean((y_true_np - y_pred_np) ** 2))
mae  = np.mean(np.abs(y_true_np - y_pred_np))
print(f"[EVAL] Test RMSE = {rmse:.2f}  |  Test MAE = {mae:.2f}")

# %% [markdown]
# ## 6. Generate Forecasts & Write to BigQuery

# %%
print("[FORECAST] Generating 7-day-ahead predictions ...")

# Take the LATEST row per (mandi, commodity) from the original Pandas DataFrame
latest = df_pd.sort_values("date").groupby(["mandi_id", "commodity_id"]).tail(1).copy()

# Build the same features on GPU (or CPU fallback)
if HAS_CUDF:
    latest_gpu = cudf.from_pandas(latest)
else:
    latest_gpu = latest.copy()
latest_gpu["month"]          = latest_gpu["date"].dt.month
latest_gpu["day_of_week"]    = latest_gpu["date"].dt.weekday
latest_gpu["mandi_code"]     = latest_gpu["mandi_id"].astype("category").cat.codes
latest_gpu["commodity_code"] = latest_gpu["commodity_id"].astype("category").cat.codes

d_latest    = xgb.DMatrix(latest_gpu[FEATURES])
predictions = model.predict(d_latest)

# Convert GPU array → NumPy if needed
pred_np = predictions.get() if hasattr(predictions, "get") else np.asarray(predictions)

# ── Build the forecast DataFrame matching BigQuery schema exactly ──
forecast = pd.DataFrame()
forecast["mandi_id"]       = latest["mandi_id"].values
forecast["commodity_id"]   = latest["commodity_id"].values
forecast["forecast_date"]  = (latest["date"] + pd.Timedelta(days=HORIZON_DAYS)).values
forecast["horizon_days"]   = HORIZON_DAYS
forecast["predicted_price"] = pred_np.astype(float)

# Confidence interval: ±1 RMSE as a simple band
forecast["confidence_low"]  = (pred_np - rmse).astype(float)
forecast["confidence_high"] = (pred_np + rmse).astype(float)
forecast["model_version"]   = MODEL_VERSION

# ── Enforce column types to match BigQuery REQUIRED modes ──
forecast["mandi_id"]      = forecast["mandi_id"].astype(str)
forecast["commodity_id"]  = forecast["commodity_id"].astype(str)
forecast["forecast_date"] = pd.to_datetime(forecast["forecast_date"]).dt.date
forecast["horizon_days"]  = forecast["horizon_days"].astype(int)

# Final column order (must match BQ schema exactly — no extras)
BQ_COLUMNS = [
    "mandi_id", "commodity_id", "forecast_date", "horizon_days",
    "predicted_price", "confidence_low", "confidence_high", "model_version",
]
forecast = forecast[BQ_COLUMNS]

print(f"[FORECAST] {len(forecast):,} forecast rows ready.")
print(forecast.head())

# ── Upload to BigQuery ──
print(f"[WRITE] Uploading to {TABLE_FORECAST} ...")

job_config = bigquery.LoadJobConfig(
    write_disposition="WRITE_TRUNCATE",    # Replace old forecasts with fresh ones
    schema=[
        bigquery.SchemaField("mandi_id",       "STRING",  mode="REQUIRED"),
        bigquery.SchemaField("commodity_id",    "STRING",  mode="REQUIRED"),
        bigquery.SchemaField("forecast_date",   "DATE",    mode="REQUIRED"),
        bigquery.SchemaField("horizon_days",    "INTEGER", mode="REQUIRED"),
        bigquery.SchemaField("predicted_price", "FLOAT"),
        bigquery.SchemaField("confidence_low",  "FLOAT"),
        bigquery.SchemaField("confidence_high", "FLOAT"),
        bigquery.SchemaField("model_version",   "STRING"),
    ],
)

job = client.load_table_from_dataframe(forecast, TABLE_FORECAST, job_config=job_config)
job.result()  # Block until done

print(f"[DONE] Successfully wrote {len(forecast):,} forecasts to BigQuery.")
print("[DONE] Phase 3 complete — predictions are live!")
