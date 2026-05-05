from typing import Any, Dict, List
from .common import normalize_preferences, score_product_base


def run_promotional_engine(products: List[Dict[str, Any]], preferences: List[str], activity_events: List[Dict[str, Any]]) -> Dict[str, Any]:
    prefs = normalize_preferences(preferences)

    interaction_boost = {}
    for event in activity_events:
        product_id = event.get("product_id")
        event_type = str(event.get("event_type") or "").lower()
        if not product_id:
            continue

        boost = 0.0
        if event_type == "view_product":
            boost = 0.5
        elif event_type == "click_product":
            boost = 1.0
        elif event_type == "add_to_cart":
            boost = 2.0
        elif event_type == "purchase":
            boost = 3.0
        elif event_type == "search":
            boost = 0.8

        interaction_boost[product_id] = interaction_boost.get(product_id, 0.0) + boost

    scored = []
    for product in products:
        pid = product.get("id")
        score = score_product_base(product, prefs) + interaction_boost.get(pid, 0.0)
        if score > 0:
            scored.append({
                "product": product,
                "promotion_score": round(score, 3)
            })

    scored.sort(key=lambda x: x["promotion_score"], reverse=True)

    return {
        "promoted_products": scored[:20],
        "engine": "promotional_intelligence"
    }
