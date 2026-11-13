from datetime import datetime, timezone

from fastapi import APIRouter

from app.api.deps import FeaturesDep, SettingsDep
from app.schemas.platform import ConfigResponse, FeaturesResponse, HealthResponse, PricingResponse
from app.services.catalog import load_json
from app.services.pricing import get_pricing

router = APIRouter(tags=["platform"])


@router.get("/health", response_model=HealthResponse, summary="Service health")
def health(settings: SettingsDep) -> HealthResponse:
    return HealthResponse(
        status="ok",
        name=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        timestamp=datetime.now(timezone.utc),
    )


@router.get("/config", response_model=ConfigResponse, summary="Branding, UI and feature configuration")
def config(settings: SettingsDep, features: FeaturesDep) -> ConfigResponse:
    data = load_json("branding.json")
    return ConfigResponse(
        app_version=settings.app_version,
        environment=settings.environment,
        branding=data["branding"],
        features=features.summary(),
        ui=data["ui"],
    )


@router.get("/features", response_model=FeaturesResponse, summary="Feature availability and integration status")
def features(service: FeaturesDep) -> FeaturesResponse:
    items = service.all()
    return FeaturesResponse(features=items, available_count=sum(f.available for f in items), total=len(items))


@router.get("/pricing", response_model=PricingResponse, summary="Subscription plans (static configuration)")
def pricing(service: FeaturesDep) -> PricingResponse:
    return get_pricing(service.get("payments").available)
