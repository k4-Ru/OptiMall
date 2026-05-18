from typing import Any, Dict, List


def run_bundle_optimization(candidates: List[Dict[str, Any]], budget: float) -> Dict[str, Any]:
    # Hybrid approach:
    # 1) Bounded knapsack on top candidates for better quality
    # 2) Greedy fallback when budget/state is too large
    items = []
    for item in candidates:
        product = item["product"]
        score = float(item.get("realtime_score") or item.get("promotion_score") or 0)
        price = float(product.get("price") or 0)
        stock = int(product.get("stock") or 0)
        if price <= 0 or stock <= 0 or score <= 0:
            continue
        ratio = score / price
        items.append((product, score, ratio, int(round(price * 100))))

    items.sort(key=lambda x: x[2], reverse=True)

    budget_cents = int(round(float(budget) * 100))
    knapsack_items = items[:40]
    can_use_knapsack = 0 < budget_cents <= 300000 and len(knapsack_items) > 0

    if can_use_knapsack:
        dp: Dict[int, Dict[str, Any]] = {0: {"score": 0.0, "indices": []}}
        for idx, (_product, score, _ratio, price_cents) in enumerate(knapsack_items):
            snapshot = list(dp.items())
            for spent, state in snapshot:
                next_spent = spent + price_cents
                if next_spent > budget_cents:
                    continue
                next_score = state["score"] + score
                current = dp.get(next_spent)
                if current is None or next_score > current["score"]:
                    dp[next_spent] = {"score": next_score, "indices": state["indices"] + [idx]}

        best_spent = max(dp, key=lambda spent: dp[spent]["score"])
        best_state = dp[best_spent]
        bundle = []
        for idx in best_state["indices"]:
            product, score, _ratio, _price_cents = knapsack_items[idx]
            bundle.append({
                "id": product.get("id"),
                "name": product.get("name"),
                "price": float(product.get("price")),
                "score": round(score, 3),
            })

        total = sum(float(item["price"]) for item in bundle)
        total_score = sum(float(item["score"]) for item in bundle)
        return {
            "budget": budget,
            "total_cost": round(total, 2),
            "remaining_budget": round(budget - total, 2),
            "bundle": bundle,
            "bundle_score": round(total_score, 3),
            "engine": "bundle_optimization",
            "strategy": "knapsack_bounded",
        }

    bundle = []
    total = 0.0
    total_score = 0.0

    for product, score, _ratio, _price_cents in items:
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
        "engine": "bundle_optimization",
        "strategy": "greedy_ratio",
    }
