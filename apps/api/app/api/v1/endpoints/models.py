from fastapi import APIRouter, Query

from app.api.deps import CatalogDep
from app.schemas.catalog import ModelCatalogResponse, ModelCategory, ModelDefinition

router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=ModelCatalogResponse, summary="Static model catalog")
def list_models(
    catalog: CatalogDep,
    category: ModelCategory | None = Query(default=None, description="Filter by model category."),
) -> ModelCatalogResponse:
    models = catalog.list(category)
    return ModelCatalogResponse(categories=catalog.categories, models=models, total=len(models))


@router.get("/{model_id}", response_model=ModelDefinition, summary="Single model definition")
def get_model(model_id: str, catalog: CatalogDep) -> ModelDefinition:
    return catalog.get(model_id)
