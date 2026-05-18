import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.engines.anomaly import run_anomaly_detection
from app.engines.bundle import run_bundle_optimization
from app.engines.common import extract_tags
from app.engines.promotional import run_promotional_engine
from app.engines.realtime import run_realtime_recommendation


class EngineTests(unittest.TestCase):
    def test_extract_tags_supports_json_and_csv(self):
        self.assertEqual(extract_tags('["tech","home"]'), ["tech", "home"])
        self.assertEqual(extract_tags("tech,home"), ["tech", "home"])

    def test_promotional_engine_returns_ranked_products(self):
        products = [
            {"id": 1, "name": "A", "category": "Tech", "price": 1000, "rating": 4.6, "stock": 8, "tags": ["tech"]},
            {"id": 2, "name": "B", "category": "Home", "price": 800, "rating": 4.2, "stock": 4, "tags": ["home"]},
        ]
        events = [{"event_type": "add_to_cart", "product_id": 1, "created_at": "2026-05-19T00:00:00Z"}]
        result = run_promotional_engine(products, ["Tech"], events)
        self.assertEqual(result["engine"], "promotional_intelligence")
        self.assertGreaterEqual(len(result["promoted_products"]), 1)
        self.assertIn("promotion_score", result["promoted_products"][0])

    def test_realtime_engine_reranks_with_latest_event(self):
        promoted = [
            {"product": {"id": 1, "name": "A", "category": "Tech", "price": 1000, "stock": 10}, "promotion_score": 5.0},
            {"product": {"id": 2, "name": "B", "category": "Home", "price": 800, "stock": 10}, "promotion_score": 5.0},
        ]
        result = run_realtime_recommendation(
            promoted,
            {"event_type": "click_product", "product_id": 1},
            ["Tech"],
        )
        self.assertEqual(result["engine"], "realtime_recommendation")
        self.assertEqual(result["suggestions"][0]["product"]["id"], 1)

    def test_bundle_engine_respects_budget(self):
        candidates = [
            {"product": {"id": 1, "name": "A", "price": 900, "stock": 10}, "realtime_score": 8.0},
            {"product": {"id": 2, "name": "B", "price": 700, "stock": 10}, "realtime_score": 7.0},
            {"product": {"id": 3, "name": "C", "price": 500, "stock": 10}, "realtime_score": 6.0},
        ]
        result = run_bundle_optimization(candidates, 1500)
        self.assertLessEqual(result["total_cost"], 1500)
        self.assertIn(result.get("strategy"), {"knapsack_bounded", "greedy_ratio"})

    def test_anomaly_engine_flags_high_risk(self):
        events = [{"event_type": "add_to_cart"} for _ in range(25)] + [{"event_type": "purchase"} for _ in range(11)]
        result = run_anomaly_detection(events, 60000)
        self.assertEqual(result["engine"], "anomaly_detection")
        self.assertEqual(result["risk_level"], "high")


if __name__ == "__main__":
    unittest.main()
