"""Central place where provider adapters are wired in.

Every slot is empty in this release. ``FeatureService`` treats a feature as
active only when its flag is enabled *and* its slot has an adapter, so
flipping a flag alone never makes the platform pretend to work.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from functools import lru_cache

from .account import AuthenticationProvider, PaymentProvider, TokenWalletService
from .ai import AIImageProvider, AIVideoProvider, ImageUpscaleProvider, VideoEnhanceProvider
from .infrastructure import DatabaseRepository, FileStorageProvider, GenerationQueueProvider


@dataclass
class ProviderRegistry:
    # Generation adapters are keyed by the catalog ``provider`` field.
    image: dict[str, AIImageProvider] = field(default_factory=dict)
    video: dict[str, AIVideoProvider] = field(default_factory=dict)
    upscale: dict[str, ImageUpscaleProvider] = field(default_factory=dict)
    video_enhance: dict[str, VideoEnhanceProvider] = field(default_factory=dict)

    auth: AuthenticationProvider | None = None
    payments: PaymentProvider | None = None
    wallet: TokenWalletService | None = None
    database: DatabaseRepository | None = None
    storage: FileStorageProvider | None = None
    queue: GenerationQueueProvider | None = None

    def has(self, slot: str) -> bool:
        value = getattr(self, slot)
        return bool(value) if isinstance(value, dict) else value is not None

    def has_generation_provider(self, slot: str, provider_key: str) -> bool:
        adapters = getattr(self, slot)
        return isinstance(adapters, dict) and provider_key in adapters


def build_registry() -> ProviderRegistry:
    """Instantiate adapters based on settings. Intentionally empty for now."""
    return ProviderRegistry()


@lru_cache
def get_registry() -> ProviderRegistry:
    return build_registry()
