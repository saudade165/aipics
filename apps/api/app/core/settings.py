"""Environment-driven application settings and feature flags.

Every future integration is gated by a flag. Flags only express *intent*:
a feature becomes active when its flag is true AND a provider adapter is
registered (see ``app.providers.registry``). In this release no adapters
exist, so every integration reports as unavailable regardless of flags.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Aether Studio API"
    app_version: str = "0.1.0"
    environment: Literal["development", "staging", "production"] = "development"
    log_level: str = "INFO"
    api_prefix: str = "/api/v1"
    docs_enabled: bool = True

    # Comma-separated list, e.g. "http://localhost:3000,https://app.example.com"
    cors_origins: str = Field(default="http://localhost:3000")

    # --- Feature flags (all disabled in the current release) ---------------
    ai_image_enabled: bool = False
    ai_video_enabled: bool = False
    ai_character_enabled: bool = False
    ai_upscale_enabled: bool = False
    ai_video_enhance_enabled: bool = False
    auth_enabled: bool = False
    payments_enabled: bool = False
    token_wallet_enabled: bool = False
    database_enabled: bool = False
    storage_enabled: bool = False
    queue_enabled: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def flag(self, name: str) -> bool:
        return bool(getattr(self, name))


@lru_cache
def get_settings() -> Settings:
    return Settings()
