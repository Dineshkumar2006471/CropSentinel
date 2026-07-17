# FasalSetu — GPU-Accelerated Mandi Price Intelligence for India's Farmers

**Gen AI Academy APAC Edition Hackathon (Hack2skill) — Problem Statement: Data Intelligence for Smarter Living**

*Fasal = crop, Setu = bridge. A bridge between farmers and fair prices.*

---

## 1. One-Line Pitch

FasalSetu turns India's fragmented, delayed daily mandi (agricultural market) price data into a same-day "sell now, wait, or move to a different mandi" recommendation for small and marginal farmers — computed at national scale in minutes instead of hours because the pipeline runs on GPU-accelerated data science (cuDF, cuML, Spark RAPIDS) instead of single-threaded CPU pandas/sklearn.

---

## 2. Problem Statement

### 2.1 The real-world problem

India has roughly **3,000+ regulated mandis (APMCs)** reporting daily wholesale prices for **200+ commodities** through the government's Agmarknet system, generating **over 2 million price records every month**. On paper, this is one of the richest open agricultural datasets in the world.

In practice, almost none of it reaches the person who needs it most at the moment they need it: **the farmer standing at the farm gate deciding whether to load the truck today or wait three days.**

- **85% of India's farmers are small or marginal landholders** (under 2 hectares), with no market analyst, no bulk storage, and no way to track 3,000 mandis by hand.
- A widely cited 2013 study by the National Centre for Agricultural Economics and Policy Research found that **distress sales — selling in a panic, below fair value, because of debt or lack of storage — accounted for nearly 60% of agricultural transactions** in the pre-reform system. The structural cause (information asymmetry) has not gone away.
- Perishable-crop wastage in India is estimated at tens of thousands of crores of rupees a year, much of it from farmers holding produce too long or dumping it too early because they had no reliable signal on where prices were heading.
- The raw data (Agmarknet/data.gov.in, e-NAM) is public, but it is a **spreadsheet dump of numbers in English**, updated in bulk once a day, with no forecast, no personalized recommendation, and no accessible interface for a farmer who may not be able to read a price table or navigate a website — let alone cross-compare 15 nearby mandis manually.

### 2.2 The decision that depends on this data

Every harvest day, a farmer (or the local Farmer Producer Organisation, FPO) faces the same decision loop:

> "I have 2 tonnes of tomatoes ready today. Do I sell at my nearest mandi now, hold for 2–3 days, or transport to a mandi 40 km away where prices are usually 15% higher — and will that still be true by the time I get there?"

Today this decision is made on **gut feel, yesterday's price rumor from another farmer, or whatever the local commission agent tells them** (who has an incentive to buy low). There is no accessible tool that combines historical price patterns, current arrivals, and near-term forecasts into a single, explainable "sell / hold / relocate" answer — in the farmer's own language, on the channel they already use (voice call, SMS, WhatsApp).

This is a **data-dependent decision, made under time pressure, at massive scale (100M+ farm households), repeated daily** — exactly the kind of bottleneck this hackathon problem statement is asking us to solve.

### 2.3 Who else needs this

- **FPOs and village-level aggregators** who negotiate bulk sales and need a ranked, multi-mandi comparison instead of one number.
- **State agriculture department / mandi officials**, who need an early-warning view of price crashes or supply gluts to plan market intervention (this is explicitly one of the stated goals of Agmarknet itself).
- **Procurement teams at agri-processors and exporters**, who currently pay analysts to do this comparison manually.

---

## 3. The Solution

**FasalSetu** is a data intelligence platform with three surfaces built on one accelerated pipeline:

1. **A conversational advisory agent** ("Ask FasalSetu") — a farmer names their crop, quantity, and village; the system replies in their language with a sell/hold/relocate recommendation, a price forecast range, and a plain-language reason ("arrivals in Warangal are up 20% this week because of early harvest — expect prices to soften").
2. **A price-risk dashboard** for FPOs and mandi officials — ranked mandi comparisons, glut/crash risk scores, and trend charts across commodities and regions.
3. **A proactive alert layer** — farmers who track a commodity get pushed a message when the model detects an unusual price movement forming, instead of having to go and check.

All three are powered by the same backend: a pipeline that ingests government mandi data at national scale, cleans and engineers features on GPU, trains thousands of per-mandi-per-commodity forecasting models in parallel on GPU, and serves the results through BigQuery + Looker + a Gemini-based agent.

---

## 4. Hackathon Requirement Checklist

| Requirement | How FasalSetu satisfies it |
|---|---|
| Clear real-world user & problem | Small/marginal farmers, FPOs, mandi officials — information asymmetry causing distress sales (Section 2) |
| Specific decision/bottleneck/workflow | Daily sell-now vs. hold vs. relocate decision, currently manual and delayed (Section 2.2) |
| Pipeline: ingest, clean, analyze, model, visualize | Cloud Storage → Spark RAPIDS ETL → cuDF feature engineering → cuML forecasting → BigQuery → Looker/Gemini Agent (Section 6, full detail in `design.md`) |
| Useful output | Forecast, risk score, ranked mandi recommendation, proactive alert (Section 3) |
| Evidence of acceleration | Measured cuDF vs. pandas and cuML vs. scikit-learn benchmarks on the full national dataset; Spark RAPIDS vs. vanilla Spark ETL time; see `design.md` Section 3 |
| 2+ GCP technologies | BigQuery, Cloud Storage, Managed Service for Apache Spark, Looker, Gemini Enterprise Agent Platform, GKE (5–6 used) |
| 2+ NVIDIA technologies | NVIDIA RAPIDS, cuDF/cudf.pandas, RAPIDS Accelerator for Apache Spark, NVIDIA GPUs on Google Cloud (4 used) |

---

## 5. Tech Stack

### 5.1 Google Cloud — data & application layer

| Component | Role |
|---|---|
| **Cloud Storage** | Raw landing zone for daily Agmarknet/e-NAM pulls (JSON/CSV), curated Parquet data lake, model artifact store |
| **Managed Service for Apache Spark** | Distributed ETL for the full historical backfill (10+ years × 3,000+ mandis × 200+ commodities) and daily incremental jobs, running with the RAPIDS Accelerator for Spark plugin |
| **BigQuery** | Analytical warehouse for cleaned prices, engineered features, forecasts, and risk scores; serves Looker and the agent's lookup queries |
| **Looker** | FPO / mandi-official dashboard: mandi comparison heat maps, price trend explorer, glut/crash risk board |
| **Gemini Enterprise Agent Platform** | Farmer-facing conversational advisory agent — natural language in, structured recommendation out, multilingual, deployable over chat/WhatsApp-style channels |
| **Google Kubernetes Engine (GPU node pool)** | Hosts the real-time inference microservice (FastAPI) that serves cached forecasts and on-demand recompute with low latency, autoscaling for harvest-season traffic spikes |

### 5.2 NVIDIA — acceleration layer

| Component | Role |
|---|---|
| **cuDF / cudf.pandas** | GPU-accelerated cleaning and feature engineering (rolling averages, arrival-volume trends, seasonal indices) on the full national price table — drop-in replacement for the pandas code we'd otherwise write |
| **NVIDIA RAPIDS (cuML)** | Trains one forecasting model per mandi-commodity pair (thousands of models) in parallel on GPU instead of looping through scikit-learn on CPU |
| **RAPIDS Accelerator for Apache Spark (Spark RAPIDS)** | Accelerates the Managed Spark ETL stage itself — joins, aggregations, and window functions over the multi-year, multi-mandi dataset |
| **NVIDIA GPUs on Google Cloud (L4 / A100)** | L4 GPUs in the GKE serving node pool for low-latency inference; A100 for the heavier batch training runs |

### 5.3 Supporting components (non-required, but part of a realistic build)

- **Google Maps Platform** — mandi geolocation and travel distance/time for the "relocate to a farther mandi" recommendation
- **IMD weather data** — rainfall/temperature as a feature for supply and price forecasting
- **Cloud Scheduler + Cloud Run** — daily ingestion trigger and lightweight alert-dispatch job
- **Pub/Sub** — decoupling ingestion from processing for reliability

---

## 6. Data Sources

| Source | What it provides | Access |
|---|---|---|
| **Agmarknet / data.gov.in — "Current Daily Price of Various Commodities from Various Markets (Mandi)"** | Daily min/max/modal wholesale price and arrival quantity, by mandi and commodity, government-verified | Open dataset + REST API, National Data Sharing and Accessibility Policy (NDSAP) |
| **e-NAM (National Agriculture Market)** | Integrated APMC mandi data, buy/sell offers, real-time price discovery from mandis onboarded to the electronic platform | Public portal / dashboard |
| **CEDA Agri Market Data (Ashoka University)** | Pre-compiled, cleaned daily/monthly/yearly historical price and arrival data at national/state/district level — useful as a fast-start historical dataset for the hackathon prototype so we aren't scraping years of raw Agmarknet pages by hand | Public download |
| **IMD (India Meteorological Department)** | District-level rainfall and temperature, used as a leading indicator for supply shocks | Public data feeds |
| **Google Maps Platform** | Mandi coordinates, road distance/travel time between farm location and candidate mandis | API (key required) |
| **Census / Agriculture Census** | District-level farmer demographics for prioritizing which regions/commodities to model first | Public data |

**Prototype-stage note:** for the hackathon build, we bootstrap with the CEDA historical export and a scripted pull from the data.gov.in Agmarknet API to get a multi-year, multi-mandi dataset fast (tens of millions of rows), rather than waiting on a live scraper — this is what lets us hit real GPU-scale benchmarks on day one instead of day five.

---

## 7. Key Features

1. **Conversational sell/hold/relocate advisory** in the farmer's language, explainable in one sentence.
2. **Multi-mandi ranking** — not just "the price," but the best mandi within reasonable travel distance, net of estimated transport cost.
3. **Distress-sale risk alert** — proactive push when a crash is forming for a tracked commodity, not just a dashboard the farmer has to remember to check.
4. **FPO/official dashboard** with regional glut/crash heat maps for market-intervention planning — reusing the same backend Agmarknet was originally built to serve.
5. **Confidence-scored forecasts** — every recommendation ships with an uncertainty band, not a false-precision single number.
6. **National-scale daily refresh** — because the pipeline is GPU-accelerated, the *entire* country's mandi-commodity forecast set can be recomputed every day (not just a handful of pilot mandis), which is what makes the alert layer viable at all.

---

## 8. Uniqueness / Differentiation

| Existing option | Gap | FasalSetu |
|---|---|---|
| Agmarknet portal / e-NAM dashboard | Raw numbers, English only, no forecast, no recommendation, pull-only | Recommendation + forecast + push alerts, multilingual |
| Kisan Call Centre / helplines | Human-staffed, not scalable, no data-driven forecast | Automated, always-on, backed by a national model |
| Private agri-tech price apps | Usually cover a handful of mandis/crops, static comparison only | National coverage, personalized to farmer's location and quantity, explains *why* |
| Academic price-forecasting research | Often single-crop, single-region proofs of concept, never re-run at full national scale because CPU training doesn't finish in time | GPU acceleration is what makes *daily, national-scale* retraining operationally realistic — this is the actual innovation, not just "another forecasting model" |

The uniqueness isn't the idea of forecasting mandi prices — several projects have tried that. It's that **GPU acceleration is the reason the idea becomes deployable**: training a separate model per mandi-per-commodity pair (thousands of pairs) is normally too slow to refresh daily on CPU, so most prior attempts either shrink scope to a few mandis or run weekly/monthly. FasalSetu keeps full national scope and daily freshness because cuML/cuDF/Spark RAPIDS make that fast enough to be operational, not just a research demo.

---

## 9. Success Metrics (what we'll show judges)

- **Time-to-insight:** raw daily price dump → refreshed national forecast set, measured in minutes, not overnight batch hours.
- **Processing speedup:** cuDF vs. pandas and cuML vs. scikit-learn, benchmarked on the same dataset, same hardware class, side by side.
- **Scale handled:** number of mandi-commodity pairs modeled simultaneously (target: full national set, thousands of pairs) vs. what a CPU pipeline could realistically refresh daily.
- **Decision quality proxy:** backtested recommendation accuracy — for a held-out historical week, would "wait 2 days" or "sell now" have been the better call, and did the model say so?

Full architecture, benchmarking methodology, infrastructure sizing, UI/UX flows, and the hackathon demo script are in **`design.md`**.

---

## 10. Scope: Hackathon Prototype vs. Production

| | Hackathon prototype (this submission) | Production roadmap |
|---|---|---|
| Mandi coverage | Subset (e.g., 2–3 states, top commodities) sized to run live in the demo | Full national coverage, all 3,000+ mandis |
| Data refresh | Batch backfill + scripted daily pull | Fully automated ingestion with monitoring/alerting |
| Agent channel | Web chat demo via Gemini Enterprise Agent Platform | WhatsApp Business API / IVR for feature-phone accessibility |
| Serving | Single GKE GPU node pool | Multi-region autoscaled deployment, SLA-backed |
| Validation | Backtest on historical held-out data | Live pilot with a partner FPO, farmer-reported outcome tracking |

This staged scope is deliberate: it lets the demo show a real, measured GPU speedup on a real government dataset within hackathon constraints, while the design doc lays out exactly how it extends to full national production scale.
