from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

router = APIRouter()

class MBARequest(BaseModel):
    transactions: List[List[str]]  # Each inner list = items in one order
    min_support: float = 0.05
    min_confidence: float = 0.3

@router.post("/mba")
def market_basket_analysis(req: MBARequest):
    """
    Market Basket Analysis using Apriori algorithm.
    Input: list of transactions (each = list of product names)
    Output: association rules (antecedent → consequent)
    """
    if len(req.transactions) < 5:
        # Return mock data if not enough transactions
        return {
            "rules": [
                {"antecedent": ["Whole Milk (1L)"], "consequent": ["Brown Bread (500g)"], "support": 0.42, "confidence": 0.73, "lift": 1.8},
                {"antecedent": ["Brown Bread (500g)"], "consequent": ["Butter (250g)"], "support": 0.35, "confidence": 0.61, "lift": 1.6},
                {"antecedent": ["Basmati Rice (5kg)"], "consequent": ["Sunflower Oil (1L)"], "support": 0.28, "confidence": 0.55, "lift": 1.5},
                {"antecedent": ["Pasta (500g)"], "consequent": ["Tomato Sauce (450g)"], "support": 0.31, "confidence": 0.68, "lift": 2.1},
                {"antecedent": ["Bananas (1kg)"], "consequent": ["Apples (6 pack)"], "support": 0.22, "confidence": 0.48, "lift": 1.4},
            ],
            "frequent_itemsets": [],
            "note": "Sample rules (insufficient transaction data)"
        }

    # Encode transactions
    te = TransactionEncoder()
    te_array = te.fit_transform(req.transactions)
    df = pd.DataFrame(te_array, columns=te.columns_)

    # Find frequent itemsets
    try:
        frequent_itemsets = apriori(df, min_support=req.min_support, use_colnames=True)
        if frequent_itemsets.empty:
            frequent_itemsets = apriori(df, min_support=0.02, use_colnames=True)

        rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=req.min_confidence)
        rules = rules.sort_values("lift", ascending=False).head(20)

        rules_list = [
            {
                "antecedent": list(r["antecedents"]),
                "consequent": list(r["consequents"]),
                "support": round(float(r["support"]), 4),
                "confidence": round(float(r["confidence"]), 4),
                "lift": round(float(r["lift"]), 4),
            }
            for _, r in rules.iterrows()
        ]

        itemsets_list = [
            {
                "items": list(row["itemsets"]),
                "support": round(float(row["support"]), 4),
            }
            for _, row in frequent_itemsets.iterrows()
        ]

        return {"rules": rules_list, "frequent_itemsets": itemsets_list}
    except Exception as e:
        return {"error": str(e), "rules": [], "frequent_itemsets": []}
