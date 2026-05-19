import json
from typing import Any, Dict, List


def normalize_preferences(preferences: List[str]) -> List[str]:
    return [p.strip().lower() for p in preferences if p and p.strip()]


def extract_tags(tags: Any) -> List[str]:
    if isinstance(tags, list):
        return [str(tag).lower() for tag in tags]
    if isinstance(tags, str):
        raw = tags.strip()
        if not raw:
            return []
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return [str(tag).lower() for tag in parsed]
        except json.JSONDecodeError:
            # Accept comma-delimited strings as a fallback.
            return [part.strip().lower() for part in raw.split(",") if part.strip()]
    return []


def score_product_base(product: Dict[str, Any], preferences: List[str]) -> float:
    pref_bonus = 0.0
    category = str(product.get("category") or "").lower()
    tags = extract_tags(product.get("tags"))
    tags += extract_tags(product.get("tag_vector"))
    tags = list(set(tags))

    if category and category in preferences:
        pref_bonus += 2.0

    pref_bonus += sum(1.0 for pref in preferences if pref in tags)

    price = float(product.get("price") or 0)
    rating = float(product.get("rating") or 0)
    stock = int(product.get("stock") or 0)
    popularity_score = float(product.get("popularity_score") or 0)
    outcome_boost = float(product.get("outcome_boost") or 0)

    if stock <= 0 or price <= 0:
        return 0.0

    price_factor = 1 / max(price, 1)
    popularity_bonus = min(max(popularity_score, 0), 100) * 0.03
    learned_outcome_bonus = max(0.0, min(outcome_boost, 1.0)) * 2.2
    return (rating * 1.5) + (price_factor * 30) + pref_bonus + popularity_bonus + learned_outcome_bonus
