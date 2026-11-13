"""Integration points for external AI providers.

These are interfaces only. No implementation ships in this release, and the
registry (``app.providers.registry``) starts empty, so generation can never
execute. To connect a provider later:

1. Implement the relevant ABC in ``app/providers/adapters/<provider>.py``.
2. Register it in ``build_registry`` keyed by the catalog ``provider`` field.
3. Set the matching feature flag (e.g. ``AI_IMAGE_ENABLED=true``).
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Literal

JobState = Literal["queued", "running", "succeeded", "failed", "cancelled"]


@dataclass(frozen=True)
class ProviderJob:
    """Handle returned by a provider after submitting work."""

    provider: str
    external_id: str
    state: JobState
    outputs: list[str] = field(default_factory=list)  # storage keys, never raw bytes
    error: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


class AIProvider(ABC):
    """Common lifecycle shared by every generation provider."""

    #: Matches the ``provider`` field of catalog entries in ``config/models.json``.
    key: str

    @abstractmethod
    async def get_job(self, external_id: str) -> ProviderJob: ...

    @abstractmethod
    async def cancel_job(self, external_id: str) -> None: ...

    async def healthcheck(self) -> bool:
        return True


class AIImageProvider(AIProvider):
    @abstractmethod
    async def submit_image(self, request: Any) -> ProviderJob:
        """Submit an ``ImageGenerationRequest``. Reference files arrive as storage keys."""


class AIVideoProvider(AIProvider):
    @abstractmethod
    async def submit_video(self, request: Any) -> ProviderJob:
        """Submit a ``VideoGenerationRequest`` or ``CharacterGenerationRequest``."""


class ImageUpscaleProvider(AIProvider):
    @abstractmethod
    async def submit_upscale(self, request: Any) -> ProviderJob: ...


class VideoEnhanceProvider(AIProvider):
    @abstractmethod
    async def submit_enhance(self, request: Any) -> ProviderJob: ...
