def test_health(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["name"] and body["version"]
    assert "x-request-id" in res.headers


def test_config_reports_all_features_disabled(client):
    body = client.get("/api/v1/config").json()
    assert body["branding"]["name"]
    assert body["features"]["enabled"] == []
    assert {"ai_image", "ai_video", "auth", "payments", "database", "storage"} <= set(body["features"]["disabled"])
    assert body["ui"]["uploads"]["image"]["max_mb"] == 10


def test_features_endpoint(client):
    body = client.get("/api/v1/features").json()
    assert body["available_count"] == 0
    assert body["total"] == len(body["features"])
    image = next(f for f in body["features"] if f["key"] == "ai_image")
    assert image["status"] == "disabled"
    assert image["env_var"] == "AI_IMAGE_ENABLED"


def test_flag_without_provider_is_not_available(client_with_flags_on):
    body = client_with_flags_on.get("/api/v1/features").json()
    assert body["available_count"] == 0
    assert all(f["status"] == "provider_not_configured" for f in body["features"])


def test_pricing(client):
    body = client.get("/api/v1/pricing").json()
    assert [p["id"] for p in body["plans"]] == ["explorer", "creator", "studio", "immortal"]
    assert body["billing_enabled"] is False
    studio = next(p for p in body["plans"] if p["id"] == "studio")
    assert studio["annual_monthly_price"] == round(studio["monthly_price"] * 0.8, 2)


def test_cors_allows_configured_origin(client):
    res = client.options(
        "/api/v1/health",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
    )
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_unknown_route_uses_error_envelope(client):
    res = client.get("/api/v1/does-not-exist")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "not_found"
