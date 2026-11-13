"""Token cost estimation driven entirely by catalog pricing rules.

The web app mirrors this formula in ``apps/web/lib/cost.ts`` for instant
feedback; this module stays authoritative once billing is enabled.
"""

import math

from app.schemas.catalog import ModelDefinition
from app.schemas.generation import (
    CharacterGenerationRequest,
    CostEstimate,
    GenerationRequest,
    ImageGenerationRequest,
    UpscaleRequest,
    VideoEnhanceRequest,
    VideoGenerationRequest,
)


def _resolution_multiplier(model: ModelDefinition, resolution_id: str) -> float:
    option = model.resolution(resolution_id)
    return option.multiplier if option else 1.0


def estimate_cost(model: ModelDefinition, request: GenerationRequest) -> CostEstimate:
    pricing = model.pricing
    base = pricing.base_tokens
    breakdown: list[str] = []

    if isinstance(request, ImageGenerationRequest):
        mult = _resolution_multiplier(model, request.resolution)
        total = base * mult * request.num_outputs
        breakdown.append(f"{base:g} tokens × {mult:g} ({request.resolution}) × {request.num_outputs} image(s)")
    elif isinstance(request, (VideoGenerationRequest, CharacterGenerationRequest)):
        mult = _resolution_multiplier(model, request.resolution)
        total = base * mult * request.duration
        breakdown.append(f"{base:g} tokens/s × {mult:g} ({request.resolution}) × {request.duration}s")
        if isinstance(request, VideoGenerationRequest) and request.audio and pricing.audio_tokens_per_second:
            audio = pricing.audio_tokens_per_second * request.duration
            total += audio
            breakdown.append(f"+ {audio:g} tokens for audio")
    elif isinstance(request, UpscaleRequest):
        mult = pricing.scale_multipliers.get(str(request.scale), 1.0)
        total = base * mult
        breakdown.append(f"{base:g} tokens × {mult:g} ({request.scale}× scale)")
    elif isinstance(request, VideoEnhanceRequest):
        seconds = request.video.duration_seconds or 1
        mult = _resolution_multiplier(model, request.target_resolution)
        fps_mult = pricing.fps_multipliers.get(str(request.target_fps), 1.0)
        total = base * seconds * mult * fps_mult
        breakdown.append(f"{base:g} tokens/s × {seconds:g}s × {mult:g} × {fps_mult:g} ({request.target_fps} fps)")
    else:  # pragma: no cover - exhaustive over the discriminated union
        raise TypeError(f"Unsupported request type: {type(request).__name__}")

    return CostEstimate(tokens=max(1, math.ceil(total)), breakdown=breakdown)
