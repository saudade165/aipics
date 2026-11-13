import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_feature_service
from app.core.settings import Settings
from app.main import create_app
from app.providers.registry import ProviderRegistry
from app.services.features import FeatureService


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app(Settings()))


@pytest.fixture
def client_with_flags_on() -> TestClient:
    """All flags enabled but no adapters registered."""
    flags = {name: True for name in Settings.model_fields if name.endswith("_enabled")}
    settings = Settings(**flags)
    app = create_app(settings)
    app.dependency_overrides[get_feature_service] = lambda: FeatureService(settings, ProviderRegistry())
    return TestClient(app)


IMAGE_FILE = {"name": "ref.png", "size_bytes": 2048, "mime_type": "image/png", "width": 512, "height": 512}
VIDEO_FILE = {"name": "clip.mp4", "size_bytes": 4_000_000, "mime_type": "video/mp4", "duration_seconds": 6.5}
