from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

router = APIRouter()

class CustomerData(BaseModel):
    customers: List[Dict[str, Any]]
    # Each customer: { "id": int, "total_orders": int, "total_spent": float, "avg_order_value": float }
    n_clusters: int = 3

@router.post("/cluster")
def segment_customers(req: CustomerData):
    """
    K-Means Customer Segmentation.
    Segments customers into High Value, Regular, Low Activity.
    """
    if len(req.customers) < req.n_clusters:
        # Return mock segments if not enough real data
        return {
            "segments": [
                {"label": "High Value Customers", "count": 0, "avg_spent": 0, "color": "#10b981"},
                {"label": "Regular Customers",    "count": 0, "avg_spent": 0, "color": "#3b82f6"},
                {"label": "Low Activity Customers","count": 0, "avg_spent": 0, "color": "#f59e0b"},
            ],
            "customers": [],
            "note": "Not enough data for clustering"
        }

    # Feature matrix
    features = np.array([
        [
            c.get("total_orders", 0),
            c.get("total_spent", 0),
            c.get("avg_order_value", 0),
        ]
        for c in req.customers
    ])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    kmeans = KMeans(n_clusters=req.n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    # Order clusters by avg_total_spent (descending) to assign meaningful names
    cluster_stats = []
    for c in range(req.n_clusters):
        mask = labels == c
        cluster_stats.append({
            "cluster": c,
            "count": int(mask.sum()),
            "avg_spent": float(features[mask, 1].mean()) if mask.sum() > 0 else 0,
        })
    cluster_stats.sort(key=lambda x: x["avg_spent"], reverse=True)

    segment_names = ["High Value Customers", "Regular Customers", "Low Activity Customers"]
    segment_colors = ["#10b981", "#3b82f6", "#f59e0b"]
    cluster_to_name = {cs["cluster"]: segment_names[i] for i, cs in enumerate(cluster_stats)}
    cluster_to_color = {cs["cluster"]: segment_colors[i] for i, cs in enumerate(cluster_stats)}

    enriched = []
    for i, customer in enumerate(req.customers):
        enriched.append({
            **customer,
            "segment": cluster_to_name[int(labels[i])],
            "cluster": int(labels[i]),
        })

    segments = [
        {
            "label": cluster_to_name[cs["cluster"]],
            "count": cs["count"],
            "avg_spent": round(cs["avg_spent"], 2),
            "color": cluster_to_color[cs["cluster"]],
        }
        for cs in cluster_stats
    ]

    return {"segments": segments, "customers": enriched}
