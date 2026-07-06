import os

with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update global variables
content = content.replace(
'''df = None
latest_date = None''',
'''df = None
df_forecast = None
df_risk = None
latest_date = None''')

# 2. Update load_data
old_load_data = '''@app.on_event("startup")
def load_data():
    global df, latest_date
    print("[STARTUP] Fetching data from BigQuery fact_mandi_price...")
    try:
        from google.cloud import bigquery
        client_bq = bigquery.Client(project=PROJECT_ID)
        # We fetch the latest 30 days of data to keep memory usage reasonable for the prototype
        query = f"""
            SELECT * FROM `{PROJECT_ID}.mandi_data.fact_mandi_price`
            WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        """
        df = client_bq.query(query).to_dataframe()
        
        # Rename columns to match what the rest of the code expects
        df = df.rename(columns={
            "date": "Arrival_Date",
            "modal_price": "Modal_Price",
            "min_price": "Min_Price",
            "max_price": "Max_Price",
            "_market": "Market",
            "_commodity": "Commodity",
            "_district": "District",
            "_state": "State"
        })
        
        if not df.empty:
            df['Arrival_Date'] = pd.to_datetime(df['Arrival_Date'])
            latest_date = df['Arrival_Date'].max()
            print(f"BigQuery data loaded successfully. {len(df)} records found.")
        else:
            print("BigQuery returned no records for the last 30 days.")
            latest_date = None
            
    except Exception as e:
        print(f"WARNING: Failed to load from BigQuery: {e}")
        df = pd.DataFrame()'''

new_load_data = '''@app.on_event("startup")
def load_data():
    global df, df_forecast, df_risk, latest_date
    print("[STARTUP] Fetching data from BigQuery fact_mandi_price, fact_forecast, agg_risk_score...")
    try:
        from google.cloud import bigquery
        client_bq = bigquery.Client(project=PROJECT_ID)
        
        query_mandi = f"""
            SELECT * FROM `{PROJECT_ID}.mandi_data.fact_mandi_price`
            WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
        """
        df = client_bq.query(query_mandi).to_dataframe()
        df = df.rename(columns={
            "date": "Arrival_Date",
            "modal_price": "Modal_Price",
            "min_price": "Min_Price",
            "max_price": "Max_Price",
            "_market": "Market",
            "_commodity": "Commodity",
            "_district": "District",
            "_state": "State"
        })
        if not df.empty:
            df['Arrival_Date'] = pd.to_datetime(df['Arrival_Date'])
            latest_date = df['Arrival_Date'].max()
            
        query_forecast = f"""
            SELECT *, 
                   CASE WHEN forecast_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) THEN 'Recent' 
                        ELSE 'Stale' END as data_freshness
            FROM `{PROJECT_ID}.mandi_data.fact_forecast`
        """
        df_forecast = client_bq.query(query_forecast).to_dataframe()
        if not df_forecast.empty:
            df_forecast['forecast_date'] = pd.to_datetime(df_forecast['forecast_date'])
            
        query_risk = f"SELECT * FROM `{PROJECT_ID}.mandi_data.agg_risk_score`"
        df_risk = client_bq.query(query_risk).to_dataframe()
        
        print(f"BigQuery data loaded successfully. {len(df)} price records, {len(df_forecast)} forecasts, {len(df_risk)} risk scores.")
    except Exception as e:
        print(f"WARNING: Failed to load from BigQuery: {e}")
        df = pd.DataFrame()
        df_forecast = pd.DataFrame()
        df_risk = pd.DataFrame()'''

content = content.replace(old_load_data, new_load_data)

# 3. Update prediction accuracy
content = content.replace('"91%"', '"81.85%"')

# 4. Update /api/ask
old_ask = '''    context_str = ""
    if found_commodities:
        for crop in found_commodities:
            crop_data = df[df['Commodity'] == crop]
            avg = crop_data['Modal_Price'].mean()
            min_p = crop_data['Min_Price'].min()
            max_p = crop_data['Max_Price'].max()
            context_str += f"{crop}: Avg ?{avg:.2f}/q, Min ?{min_p}/q, Max ?{max_p}/q.\\n"
    else:
        # Just give top 5 as general context
        top_5 = df.drop_duplicates('Commodity').head(5)
        for _, row in top_5.iterrows():
            context_str += f"{row['Commodity']} in {row['Market']}: ?{row['Modal_Price']}/q.\\n"'''

new_ask = '''    context_str = "SYSTEM CONTEXT (DO NOT HALLUCINATE):\\n"
    if found_commodities:
        for crop in found_commodities:
            crop_lower = str(crop).lower()
            context_str += f"User is asking about: {crop}.\\n"
            
            crop_data = df[df['Commodity'].str.lower() == crop_lower]
            current_price = crop_data['Modal_Price'].mean() if not crop_data.empty else 0
            
            forecast_row = pd.DataFrame()
            if df_forecast is not None and not df_forecast.empty:
                f_data = df_forecast[df_forecast['commodity_id'] == crop_lower]
                if not f_data.empty:
                    forecast_row = f_data.sort_values('forecast_date', ascending=False).iloc[0]
                    
            risk_row = pd.DataFrame()
            if df_risk is not None and not df_risk.empty:
                r_data = df_risk[df_risk['commodity_id'] == crop_lower]
                if not r_data.empty:
                    risk_row = r_data.sort_values('date', ascending=False).iloc[0]
            
            if current_price > 0:
                context_str += f"Current Price: ₹{current_price:.0f}/q\\n"
                
            if not forecast_row.empty:
                pred_7d = forecast_row['predicted_price_7d']
                trend_val = ((pred_7d - current_price) / current_price) * 100 if current_price > 0 else 0
                dir_str = "Up" if trend_val > 0 else "Down"
                freshness = forecast_row['data_freshness']
                context_str += f"7-Day Predicted Price: ₹{pred_7d:.0f}/q ({dir_str} {abs(trend_val):.1f}%)\\n"
                if freshness == 'Stale':
                    context_str += "Note: Limited recent data for this market. Forecast is based on historical data older than 30 days.\\n"
                    
            if not risk_row.empty:
                r_score = risk_row['risk_score']
                risk_lvl = "High Risk" if r_score > 30 else "Moderate Risk" if r_score > 15 else "Low Risk"
                context_str += f"30-Day Volatility Risk Score: {r_score:.1f} ({risk_lvl})\\n"
                
            context_str += "Use this exact data to advise the farmer.\\n\\n"
    else:
        # Just give top 5 as general context
        top_5 = df.drop_duplicates('Commodity').head(5)
        for _, row in top_5.iterrows():
            context_str += f"{row['Commodity']} in {row['Market']}: ₹{row['Modal_Price']}/q.\\n"
        context_str += "Use this exact data to advise the farmer.\\n\\n"'''

content = content.replace(old_ask, new_ask)

# 5. Update get_top_movers
old_movers = '''@app.get("/api/forecast/top-movers")
def get_top_movers():
    """Returns top moving commodities for the live rate board."""
    if df is None or df.empty:
        return []
    
    # Let's mock a trend based on Min vs Max or just take some unique commodities
    top_commodities = df.drop_duplicates('Commodity').head(5)
    results = []
    
    for idx, row in top_commodities.iterrows():
        # KILLED FABRICATED DATA: We return 0.0 for trend until fact_forecast is wired in Step 3
        trend = 0.0
        results.append({
            'commodity': row['Commodity'],
            'current_price': f"₹{row['Modal_Price']:.0f}/q",
            'predicted_price': f"₹{row['Modal_Price']:.0f}/q",  # Will use model later
            'trend': trend,
            'risk_level': 'high' if abs(trend) > 10 else 'medium' if abs(trend) > 5 else 'low'
        })
        
    return results'''

new_movers = '''@app.get("/api/forecast/top-movers")
def get_top_movers():
    """Returns top moving commodities for the live rate board."""
    if df_forecast is None or df_forecast.empty or df is None or df.empty:
        return []
    
    results = []
    latest_forecasts = df_forecast.sort_values('forecast_date', ascending=False).drop_duplicates('commodity_id').head(5)
    
    for idx, row in latest_forecasts.iterrows():
        c_id = row['commodity_id']
        pred_7d = row['predicted_price_7d']
        freshness = row['data_freshness']
        
        crop_data = df[df['Commodity'].str.lower() == c_id]
        curr_price = crop_data['Modal_Price'].mean() if not crop_data.empty else pred_7d
        
        trend = 0.0
        if curr_price > 0:
            trend = ((pred_7d - curr_price) / curr_price) * 100
            
        fresh_msg = "" if freshness == "Recent" else " (Limited recent data)"
        
        results.append({
            'commodity': str(c_id).title(),
            'current_price': f"₹{curr_price:.0f}/q{fresh_msg}",
            'predicted_price': f"₹{pred_7d:.0f}/q",
            'trend': round(trend, 1),
            'risk_level': 'high' if abs(trend) > 10 else 'medium' if abs(trend) > 5 else 'low'
        })
        
    return results'''

content = content.replace(old_movers, new_movers)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated backend/main.py")
