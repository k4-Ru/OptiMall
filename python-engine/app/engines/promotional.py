from datetime import datetime, timezone
from typing import Any, Dict, List
from .common import normalize_preferences, score_product_base


def _event_recency_weight(event: Dict[str, Any]) -> float:
    created_at = event.get("created_at")
    if not created_at:
        return 1.0

    try:
        iso_value = str(created_at).replace("Z", "+00:00")
        ts = datetime.fromisoformat(iso_value)
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        age_hours = max((datetime.now(timezone.utc) - ts).total_seconds() / 3600.0, 0.0)
    except Exception:
        return 1.0

    # Simple bucketed decay: newest interactions dominate ranking.
    if age_hours <= 24:
        return 1.0
    if age_hours <= 72:
        return 0.8
    if age_hours <= 168:
        return 0.6
    if age_hours <= 720:
        return 0.4
    return 0.25


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

        weighted_boost = boost * _event_recency_weight(event)
        interaction_boost[product_id] = interaction_boost.get(product_id, 0.0) + weighted_boost

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
