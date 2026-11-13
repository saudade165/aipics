from app.config.features import FEATURES, FeatureDefinition
from app.core.settings import Settings
from app.providers.registry import ProviderRegistry
from app.schemas.platform import FeatureInfo, FeatureSummary


class FeatureService:
    """Combines feature flags with provider availability into a single status."""

    def __init__(self, settings: Settings, registry: ProviderRegistry) -> None:
        self._settings = settings
        self._registry = registry

    def describe(self, feature: FeatureDefinition) -> FeatureInfo:
        flag = self._settings.flag(feature.setting)
        configured = self._registry.has(feature.provider_slot)
        if flag and configured:
            status, message = "active", "Feature is enabled and a provider is configured."
        elif flag:
            status = "provider_not_configured"
            message = f"{feature.env_var} is true, but no provider adapter is registered yet."
        else:
            status = "disabled"
            message = f"Disabled in this release. Set {feature.env_var}=true once a provider is connected."
        return FeatureInfo(
            key=feature.key,
            name=feature.name,
            description=feature.description,
            category=feature.category,
            env_var=feature.env_var,
            flag_enabled=flag,
            provider_configured=configured,
            available=status == "active",
            status=status,
            message=message,
        )

    def all(self) -> list[FeatureInfo]:
        return [self.describe(f) for f in FEATURES]

    def get(self, key: str) -> FeatureInfo:
        feature = next(f for f in FEATURES if f.key == key)
        return self.describe(feature)

    def summary(self) -> FeatureSummary:
        infos = self.all()
        return FeatureSummary(
            enabled=[f.key for f in infos if f.available],
            disabled=[f.key for f in infos if not f.available],
        )
