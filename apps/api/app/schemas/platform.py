from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    name: str
    version: str
    environment: str
    timestamp: datetime


class Branding(BaseModel):
    name: str
    short_name: str
    tagline: str
    support_email: str | None = None


class UploadRule(BaseModel):
    max_mb: int
    mime_types: list[str]


class Announcement(BaseModel):
    id: str
    title: str
    body: str
    tag: str
    date: str


class LabeledOption(BaseModel):
    id: str | None = None
    code: str | None = None
    label: str


class UIConfig(BaseModel):
    default_language: str
    languages: list[LabeledOption]
    accents: list[LabeledOption]
    uploads: dict[Literal["image", "video"], UploadRule]
    announcements: list[Announcement]


class FeatureSummary(BaseModel):
    enabled: list[str]
    disabled: list[str]


class ConfigResponse(BaseModel):
    app_version: str
    environment: str
    branding: Branding
    features: FeatureSummary
    ui: UIConfig


FeatureStatus = Literal["active", "disabled", "provider_not_configured"]


class FeatureInfo(BaseModel):
    key: str
    name: str
    description: str
    category: Literal["generation", "account", "infrastructure"]
    env_var: str
    flag_enabled: bool
    provider_configured: bool
    available: bool
    status: FeatureStatus
    message: str


class FeaturesResponse(BaseModel):
    features: list[FeatureInfo]
    available_count: int
    total: int


class PlanLimits(BaseModel):
    concurrent_jobs: int
    max_video_seconds: int
    max_resolution: str
    history_days: int


class Plan(BaseModel):
    id: str
    name: str
    tagline: str
    monthly_price: float
    annual_monthly_price: float
    monthly_tokens: int
    highlight: bool
    cta: str
    model_access: str
    limits: PlanLimits
    features: list[str]


class ComparisonRow(BaseModel):
    label: str
    values: dict[str, str | bool]


class ComparisonGroup(BaseModel):
    group: str
    rows: list[ComparisonRow]


class PricingResponse(BaseModel):
    currency: str
    annual_discount_percent: int
    billing_enabled: bool
    billing_enabled_note: str
    plans: list[Plan]
    comparison: list[ComparisonGroup]
