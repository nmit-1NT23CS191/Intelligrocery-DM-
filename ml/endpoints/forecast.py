from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.linear_model import LinearRegression

router = APIRouter()

class ForecastRequest(BaseModel):
    sales: List[float]
    periods: int = 6  # How many future periods to predict

@router.post("/forecast")
def forecast_demand(req: ForecastRequest):
    """
    Linear Regression Demand Forecasting.
    Input: list of historical sales figures
    Output: predicted future sales for the next N periods
    """
    if len(req.sales) < 2:
        return {"error": "Need at least 2 data points for forecasting"}

    # Prepare data
    X = np.array(range(len(req.sales))).reshape(-1, 1)
    y = np.array(req.sales)

    # Train model
    model = LinearRegression()
    model.fit(X, y)

    # Predict future periods
    future_X = np.array(range(len(req.sales), len(req.sales) + req.periods)).reshape(-1, 1)
    predictions = model.predict(future_X)

    # R² score
    score = model.score(X, y)

    # Build response with labels
    historical = [{"period": i + 1, "sales": float(v)} for i, v in enumerate(req.sales)]
    forecast = [
        {"period": len(req.sales) + i + 1, "sales": round(max(0, float(p)), 2)}
        for i, p in enumerate(predictions)
    ]

    return {
        "historical": historical,
        "forecast": forecast,
        "r2_score": round(score, 4),
        "trend": "increasing" if model.coef_[0] > 0 else "decreasing",
        "slope": round(float(model.coef_[0]), 4),
        "intercept": round(float(model.intercept_), 4),
    }
