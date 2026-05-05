from typing import Any, Dict, List


def run_bundle_optimization(candidates: List[Dict[str, Any]], budget: float) -> Dict[str, Any]:
    # Greedy-by-score/price ratio approximation for fast response.
    items = []
    for item in candidates:
        product = item["product"]
        score = float(item.get("realtime_score") or item.get("promotion_score") or 0)
        price = float(product.get("price") or 0)
        stock = int(product.get("stock") or 0)
        if price <= 0 or stock <= 0 or score <= 0:
            continue
        ratio = score / price
        items.append((product, score, ratio))

    items.sort(key=lambda x: x[2], reverse=True)

    bundle = []
    total = 0.0
    total_score = 0.0

    for product, score, _ratio in items:
        price = float(product["price"])
        if total + price <= budget:
            bundle.append({
                "id": product.get("id"),
                "name": product.get("name"),
                "price": price,
                "score": round(score, 3)
            })
            total += price
            total_score += score

    return {
        "budget": budget,
        "total_cost": round(total, 2),
        "remaining_budget": round(budget - total, 2),
        "bundle": bundle,
        "bundle_score": round(total_score, 3),
        "engine": "bundle_optimization"
    }
