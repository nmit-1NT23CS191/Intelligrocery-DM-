from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.forecast import router as forecast_router
from endpoints.cluster import router as cluster_router
from endpoints.mba import router as mba_router

app = FastAPI(
    title="IntelliGrocery-Pro ML Service",
    description="Machine Learning microservice for demand forecasting, customer segmentation, and market basket analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast_router)
app.include_router(cluster_router)
app.include_router(mba_router)

@app.get("/")
def health():
    return {"status": "ok", "service": "IntelliGrocery ML Service"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
