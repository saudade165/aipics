"""Validates generation configurations against the catalog.

Execution is intentionally not implemented. Once a provider adapter is
registered and its feature flag is enabled, ``preview`` is where the request
would be handed to the queue (``GenerationQueueProvider``) after reserving
tokens (``TokenWalletService``).
"""

import logging

from app.config.features import GENERATION_FEATURE
from app.core.errors import ValidationProblem
from app.schemas.catalog import ModelDefinition
from app.schemas.generation import (
    CharacterGenerationRequest,
    GenerationPreviewResponse,
    GenerationRequest,
    ImageGenerationRequest,
    UpscaleRequest,
    VideoEnhanceRequest,
    VideoGenerationRequest,
)

from .catalog import CatalogService
from .cost import estimate_cost
from .features import FeatureService

logger = logging.getLogger("app.generation")

DISABLED_MESSAGE = "AI integrations are not connected yet."


def _require(condition: bool, field: str, message: str) -> None:
    if not condition:
        raise ValidationProblem(message, details=[{"field": field, "message": message}])


def _require_option(value: object, allowed: list, field: str, model: ModelDefinition) -> None:
    _require(value in allowed, field, f"'{value}' is not supported by {model.name}. Allowed: {', '.join(map(str, allowed))}.")


class GenerationService:
    def __init__(self, catalog: CatalogService, features: FeatureService) -> None:
        self._catalog = catalog
        self._features = features

    def validate(self, request: GenerationRequest) -> ModelDefinition:
        model = self._catalog.find(request.model_id)
        _require(model is not None, "model_id", f"Unknown model '{request.model_id}'.")
        assert model is not None
        _require(
            model.category == request.kind,
            "model_id",
            f"{model.name} is a '{model.category}' model and cannot be used for '{request.kind}'.",
        )

        if isinstance(request, ImageGenerationRequest):
            _require_option(request.aspect_ratio, model.aspect_ratios, "aspect_ratio", model)
            _require_option(request.resolution, [r.id for r in model.resolutions], "resolution", model)
            _require(request.num_outputs <= model.max_outputs, "num_outputs", f"{model.name} supports up to {model.max_outputs} outputs.")
            self._check_references(len(request.references), model)
            _require(
                not request.negative_prompt or model.supports_negative_prompt,
                "negative_prompt",
                f"{model.name} does not support negative prompts.",
            )

        elif isinstance(request, VideoGenerationRequest):
            _require_option(request.mode, model.capabilities, "mode", model)
            self._check_video_options(request.aspect_ratio, request.resolution, request.duration, model)
            _require(not request.audio or model.supports_audio, "audio", f"{model.name} does not generate audio.")
            if request.mode == "image_to_video":
                _require(request.first_frame is not None, "first_frame", "Image-to-video requires a first frame.")
            _require(
                request.last_frame is None or model.supports_last_frame,
                "last_frame",
                f"{model.name} does not support last-frame conditioning.",
            )
            if request.mode == "reference_to_video":
                _require(
                    request.reference_video is not None or len(request.references) > 0,
                    "references",
                    "Reference-to-video requires a reference video or at least one reference image.",
                )
            self._check_references(len(request.references), model)

        elif isinstance(request, CharacterGenerationRequest):
            _require_option(request.workflow, model.workflows, "workflow", model)
            self._check_video_options(request.aspect_ratio, request.resolution, request.duration, model)
            self._check_references(len(request.references), model)
            if request.workflow in ("motion_transfer", "character_replacement"):
                _require(request.reference_video is not None, "reference_video", "This workflow requires a driving video.")

        elif isinstance(request, UpscaleRequest):
            _require_option(request.scale, model.scales, "scale", model)

        elif isinstance(request, VideoEnhanceRequest):
            _require_option(request.target_resolution, [r.id for r in model.resolutions], "target_resolution", model)
            _require_option(request.target_fps, model.fps_options, "target_fps", model)

        return model

    def preview(self, request: GenerationRequest) -> GenerationPreviewResponse:
        model = self.validate(request)
        feature = self._features.get(GENERATION_FEATURE[request.kind])
        cost = estimate_cost(model, request)
        logger.info("Validated %s request for model=%s (feature status=%s)", request.kind, model.id, feature.status)

        # Even if a future flag is flipped, nothing executes without an adapter
        # and the queue/wallet integrations described above.
        return GenerationPreviewResponse(
            status="integration_disabled",
            message=DISABLED_MESSAGE,
            feature=feature.key,
            feature_status=feature.status,
            model_id=model.id,
            model_name=model.name,
            estimated_cost=cost,
            next_steps=[
                f"Implement a provider adapter for '{model.provider}' in app/providers.",
                f"Register it in app/providers/registry.py and set {feature.env_var}=true.",
                "Enable STORAGE_ENABLED and QUEUE_ENABLED for file handling and background jobs.",
            ],
        )

    @staticmethod
    def _check_video_options(aspect_ratio: str, resolution: str, duration: int, model: ModelDefinition) -> None:
        _require_option(aspect_ratio, model.aspect_ratios, "aspect_ratio", model)
        _require_option(resolution, [r.id for r in model.resolutions], "resolution", model)
        _require_option(duration, model.durations, "duration", model)

    @staticmethod
    def _check_references(count: int, model: ModelDefinition) -> None:
        _require(
            count <= model.max_reference_images,
            "references",
            f"{model.name} accepts up to {model.max_reference_images} reference image(s).",
        )
