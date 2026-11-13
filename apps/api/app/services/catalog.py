import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.core.errors import NotFoundError
from app.schemas.catalog import CategoryInfo, ModelCategory, ModelDefinition

CONFIG_DIR = Path(__file__).resolve().parent.parent / "config"


def load_json(name: str) -> dict[str, Any]:
    with (CONFIG_DIR / name).open(encoding="utf-8") as fh:
        return json.load(fh)


class CatalogService:
    """Read-only access to the static model catalog in ``config/models.json``."""

    def __init__(self, data: dict[str, Any]) -> None:
        self.categories = [CategoryInfo.model_validate(c) for c in data["categories"]]
        self._models = [ModelDefinition.model_validate(m) for m in data["models"]]
        self._by_id = {m.id: m for m in self._models}
        if len(self._by_id) != len(self._models):
            raise ValueError("Duplicate model ids in models.json")

    def list(self, category: ModelCategory | None = None) -> list[ModelDefinition]:
        if category is None:
            return list(self._models)
        return [m for m in self._models if m.category == category]

    def find(self, model_id: str) -> ModelDefinition | None:
        return self._by_id.get(model_id)

    def get(self, model_id: str) -> ModelDefinition:
        model = self.find(model_id)
        if model is None:
            raise NotFoundError(f"Model '{model_id}' does not exist in the catalog.")
        return model


@lru_cache
def get_catalog() -> CatalogService:
    return CatalogService(load_json("models.json"))
