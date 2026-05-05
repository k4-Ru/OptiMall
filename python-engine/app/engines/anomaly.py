from typing import Any, Dict, List


def run_anomaly_detection(activity_events: List[Dict[str, Any]], order_total: float) -> Dict[str, Any]:
    risk_score = 0
    reasons = []

    add_to_cart_count = sum(1 for e in activity_events if str(e.get("event_type") or "") == "add_to_cart")
    purchase_count = sum(1 for e in activity_events if str(e.get("event_type") or "") == "purchase")
    search_count = sum(1 for e in activity_events if str(e.get("event_type") or "") == "search")

    if add_to_cart_count > 20:
        risk_score += 30
        reasons.append("Unusually high add_to_cart volume")

    if purchase_count > 10:
        risk_score += 20
        reasons.append("Unusually high purchase volume")

    if search_count > 50:
        risk_score += 10
        reasons.append("Excessive search activity")

    if order_total > 50000:
        risk_score += 40
        reasons.append("High-value order total")

    risk_level = "low"
    if risk_score >= 60:
        risk_level = "high"
    elif risk_score >= 30:
        risk_level = "medium"

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "reasons": reasons,
        "engine": "anomaly_detection"
    }
