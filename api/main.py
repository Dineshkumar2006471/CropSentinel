from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import forecast, risk, recommend, meta

app = FastAPI(title="FasalSetu API", description="Backend API for agricultural predictions", version="1.0.0")

# Allow CORS for React frontend (Vite default port 5173 and any production URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes, in prod restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast.router, prefix="/api/forecast", tags=["forecast"])
app.include_router(risk.router, prefix="/api/risk", tags=["risk"])
app.include_router(recommend.router, prefix="/api/recommend", tags=["recommend"])
app.include_router(meta.router, prefix="/api/meta", tags=["meta"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FasalSetu API is running"}
