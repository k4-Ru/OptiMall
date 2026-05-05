from typing import Any, Dict, List
from .common import normalize_preferences


def run_realtime_recommendation(promoted_products: List[Dict[str, Any]], latest_event: Dict[str, Any], preferences: List[str]) -> Dict[str, Any]:
    prefs = normalize_preferences(preferences)
    event_type = str((latest_event or {}).get("event_type") or "").lower()
    event_product_id = (latest_event or {}).get("product_id")

    reranked = []
    for item in promoted_products:
        product = item["product"]
        score = float(item["promotion_score"])

        if event_product_id and product.get("id") == event_product_id:
            if event_type in {"click_product", "add_to_cart"}:
                score += 2.0
            elif event_type == "view_product":
                score += 1.0

        category = str(product.get("category") or "").lower()
        if category and category in prefs:
            score += 0.5

        reranked.append({
            "product": product,
            "realtime_score": round(score, 3)
        })

    reranked.sort(key=lambda x: x["realtime_score"], reverse=True)

    return {
        "suggestions": reranked[:20],
        "engine": "realtime_recommendation"
    }
