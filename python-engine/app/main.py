from typing import Any, Dict, List, Optional
from fastapi import FastAPI
from pydantic import BaseModel, Field

from .engines import (
    run_anomaly_detection,
    run_bundle_optimization,
    run_promotional_engine,
    run_realtime_recommendation,
)

app = FastAPI(title="OptiMall Python Engine", version="0.2.0")


class Product(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    price: float
    rating: Optional[float] = 0.0
    stock: Optional[int] = 0
    tags: Optional[Any] = None
    popularity_score: Optional[float] = 0.0
    tag_vector: Optional[Any] = None
    extra: Optional[Any] = None


class ActivityEvent(BaseModel):
    event_type: str
    product_id: Optional[int] = None
    search_query: Optional[str] = None


class PromoRequest(BaseModel):
    products: List[Product] = []
    preferences: List[str] = []
    activity_events: List[ActivityEvent] = []


class RealtimeRequest(BaseModel):
    promoted_products: List[Dict[str, Any]] = []
    latest_event: Optional[ActivityEvent] = None
    preferences: List[str] = []


class BundleRequest(BaseModel):
    budget: float = Field(gt=0)
    candidates: List[Dict[str, Any]] = []


class AnomalyRequest(BaseModel):
    activity_events: List[ActivityEvent] = []
    order_total: float = 0.0


class PipelineRequest(BaseModel):
    budget: float = Field(gt=0)
    preferences: List[str] = []
    products: List[Product] = []
    activity_events: List[ActivityEvent] = []
    latest_event: Optional[ActivityEvent] = None


class RecommendationRequest(BaseModel):
    budget: float = Field(gt=0)
    preferences: List[str] = []
    user_id: Optional[int] = None
    products: List[Product] = []


@app.get('/health')
def health():
    return {"status": "ok", "service": "python-engine", "version": "0.2.0"}


@app.post('/intelligence/promotions')
def promotions(payload: PromoRequest):
    return run_promotional_engine(
        products=[p.model_dump() for p in payload.products],
        preferences=payload.preferences,
        activity_events=[e.model_dump() for e in payload.activity_events],
    )


@app.post('/intelligence/realtime-recommendations')
def realtime_recommendations(payload: RealtimeRequest):
    latest = payload.latest_event.model_dump() if payload.latest_event else {}
    return run_realtime_recommendation(
        promoted_products=payload.promoted_products,
        latest_event=latest,
        preferences=payload.preferences,
    )


@app.post('/intelligence/bundle-optimize')
def bundle_optimize(payload: BundleRequest):
    return run_bundle_optimization(
        candidates=payload.candidates,
        budget=payload.budget,
    )


@app.post('/intelligence/anomaly-check')
def anomaly_check(payload: AnomalyRequest):
    return run_anomaly_detection(
        activity_events=[e.model_dump() for e in payload.activity_events],
        order_total=payload.order_total,
    )


@app.post('/intelligence/pipeline')
def intelligence_pipeline(payload: PipelineRequest):
    promo = run_promotional_engine(
        products=[p.model_dump() for p in payload.products],
        preferences=payload.preferences,
        activity_events=[e.model_dump() for e in payload.activity_events],
    )

    realtime = run_realtime_recommendation(
        promoted_products=promo["promoted_products"],
        latest_event=payload.latest_event.model_dump() if payload.latest_event else {},
        preferences=payload.preferences,
    )

    bundle = run_bundle_optimization(
        candidates=realtime["suggestions"],
        budget=payload.budget,
    )

    anomaly = run_anomaly_detection(
        activity_events=[e.model_dump() for e in payload.activity_events],
        order_total=bundle["total_cost"],
    )

    return {
        "promotional_engine": promo,
        "realtime_recommendation": realtime,
        "bundle_optimization": bundle,
        "anomaly_detection": anomaly,
    }


@app.post('/recommend')
def recommend(payload: RecommendationRequest):
    # Backward-compatible endpoint used by current Node API.
    pipeline = intelligence_pipeline(
        PipelineRequest(
            budget=payload.budget,
            preferences=payload.preferences,
            products=payload.products,
            activity_events=[],
            latest_event=None,
        )
    )

    bundle = pipeline["bundle_optimization"]
    return {
        "budget": bundle["budget"],
        "total_cost": bundle["total_cost"],
        "remaining_budget": bundle["remaining_budget"],
        "bundle": bundle["bundle"],
        "explanation": "Bundle selected via promotional + realtime ranking under budget constraint.",
    }
