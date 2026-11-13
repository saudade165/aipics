from typing import Literal

from pydantic import BaseModel, Field

ModelCategory = Literal["image", "video", "character", "upscale", "video_enhance"]


class ResolutionOption(BaseModel):
    id: str
    label: str
    detail: str | None = None
    multiplier: float = Field(default=1.0, gt=0)


class ModelPricing(BaseModel):
    unit: Literal["per_output", "per_second", "per_job"]
    base_tokens: float = Field(ge=0)
    audio_tokens_per_second: float = 0
    scale_multipliers: dict[str, float] = Field(default_factory=dict)
    fps_multipliers: dict[str, float] = Field(default_factory=dict)


class ModelDefinition(BaseModel):
    id: str
    name: str
    vendor: str
    category: ModelCategory
    provider: str = Field(description="Adapter key used by the provider registry.")
    tagline: str
    description: str
    badges: list[str] = Field(default_factory=list)
    accent: tuple[str, str]
    capabilities: list[str] = Field(default_factory=list)
    workflows: list[str] = Field(default_factory=list)
    aspect_ratios: list[str] = Field(default_factory=list)
    resolutions: list[ResolutionOption] = Field(default_factory=list)
    durations: list[int] = Field(default_factory=list)
    scales: list[int] = Field(default_factory=list)
    fps_options: list[int] = Field(default_factory=list)
    max_outputs: int = 1
    max_reference_images: int = 0
    supports_negative_prompt: bool = False
    supports_audio: bool = False
    supports_last_frame: bool = False
    pricing: ModelPricing
    status: Literal["connected", "not_connected"] = "not_connected"

    def resolution(self, resolution_id: str) -> ResolutionOption | None:
        return next((r for r in self.resolutions if r.id == resolution_id), None)


class CategoryInfo(BaseModel):
    id: ModelCategory
    label: str


class ModelCatalogResponse(BaseModel):
    categories: list[CategoryInfo]
    models: list[ModelDefinition]
    total: int
