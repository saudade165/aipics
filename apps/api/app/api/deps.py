"""FastAPI dependency providers. Override these in tests or future adapters."""

from typing import Annotated

from fastapi import Depends

from app.core.settings import Settings, get_settings
from app.providers.registry import ProviderRegistry, get_registry
from app.services.catalog import CatalogService, get_catalog
from app.services.features import FeatureService
from app.services.generation import GenerationService

SettingsDep = Annotated[Settings, Depends(get_settings)]
CatalogDep = Annotated[CatalogService, Depends(get_catalog)]


def get_feature_service(
    settings: SettingsDep, registry: Annotated[ProviderRegistry, Depends(get_registry)]
) -> FeatureService:
    return FeatureService(settings, registry)


FeaturesDep = Annotated[FeatureService, Depends(get_feature_service)]


def get_generation_service(catalog: CatalogDep, features: FeaturesDep) -> GenerationService:
    return GenerationService(catalog, features)


GenerationDep = Annotated[GenerationService, Depends(get_generation_service)]
