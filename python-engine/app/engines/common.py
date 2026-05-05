from typing import Any, Dict, List


def normalize_preferences(preferences: List[str]) -> List[str]:
    return [p.strip().lower() for p in preferences if p and p.strip()]


def extract_tags(tags: Any) -> List[str]:
    if isinstance(tags, list):
        return [str(tag).lower() for tag in tags]
    return []


def score_product_base(product: Dict[str, Any], preferences: List[str]) -> float:
    pref_bonus = 0.0
    category = str(product.get("category") or "").lower()
    tags = extract_tags(product.get("tags"))

    if category and category in preferences:
        pref_bonus += 2.0

    pref_bonus += sum(1.0 for pref in preferences if pref in tags)

    price = float(product.get("price") or 0)
    rating = float(product.get("rating") or 0)
    stock = int(product.get("stock") or 0)

    if stock <= 0 or price <= 0:
        return 0.0

    price_factor = 1 / max(price, 1)
    return (rating * 1.5) + (price_factor * 30) + pref_bonus
