"""Static catalog of platform features and the flags/providers that gate them."""

from dataclasses import dataclass
from typing import Literal

FeatureKey = Literal[
    "ai_image",
    "ai_video",
    "ai_character",
    "ai_upscale",
    "ai_video_enhance",
    "auth",
    "payments",
    "token_wallet",
    "database",
    "storage",
    "queue",
]


@dataclass(frozen=True)
class FeatureDefinition:
    key: FeatureKey
    name: str
    description: str
    category: Literal["generation", "account", "infrastructure"]
    setting: str  # attribute on Settings, e.g. "ai_image_enabled"
    provider_slot: str  # key in ProviderRegistry

    @property
    def env_var(self) -> str:
        return self.setting.upper()


FEATURES: tuple[FeatureDefinition, ...] = (
    FeatureDefinition("ai_image", "AI image generation", "Text-to-image and image-to-image via external providers.", "generation", "ai_image_enabled", "image"),
    FeatureDefinition("ai_video", "AI video generation", "Text, image and reference-to-video generation.", "generation", "ai_video_enabled", "video"),
    FeatureDefinition("ai_character", "Character workflows", "Motion transfer, character replacement and multi-reference video.", "generation", "ai_character_enabled", "video"),
    FeatureDefinition("ai_upscale", "Image upscaling", "Resolution enhancement for still images.", "generation", "ai_upscale_enabled", "upscale"),
    FeatureDefinition("ai_video_enhance", "Video enhancement", "Video upscaling, denoising and frame interpolation.", "generation", "ai_video_enhance_enabled", "video_enhance"),
    FeatureDefinition("auth", "Authentication", "User accounts and sign-in (email, OAuth providers).", "account", "auth_enabled", "auth"),
    FeatureDefinition("payments", "Payments", "Subscriptions and token purchases.", "account", "payments_enabled", "payments"),
    FeatureDefinition("token_wallet", "Token wallet", "Token balances, reservations and deductions.", "account", "token_wallet_enabled", "wallet"),
    FeatureDefinition("database", "Database", "Persistent storage for users, generations and billing (PostgreSQL planned).", "infrastructure", "database_enabled", "database"),
    FeatureDefinition("storage", "File storage", "Persistent storage for uploads and outputs (S3-compatible planned).", "infrastructure", "storage_enabled", "storage"),
    FeatureDefinition("queue", "Generation queue", "Background job queue for long-running generations (Redis planned).", "infrastructure", "queue_enabled", "queue"),
)

# Which feature gates which generation kind.
GENERATION_FEATURE: dict[str, FeatureKey] = {
    "image": "ai_image",
    "video": "ai_video",
    "character": "ai_character",
    "upscale": "ai_upscale",
    "video_enhance": "ai_video_enhance",
}
