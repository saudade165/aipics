def test_list_models(client):
    body = client.get("/api/v1/models").json()
    assert body["total"] == len(body["models"]) > 0
    ids = {m["id"] for m in body["models"]}
    assert {"flux", "gpt-image", "seedream", "nano-banana", "kling", "seedance", "wan"} <= ids
    assert all(m["status"] == "not_connected" for m in body["models"])


def test_filter_by_category(client):
    body = client.get("/api/v1/models", params={"category": "video"}).json()
    assert body["models"] and all(m["category"] == "video" for m in body["models"])


def test_invalid_category_is_rejected(client):
    assert client.get("/api/v1/models", params={"category": "audio"}).status_code == 422


def test_get_model(client):
    assert client.get("/api/v1/models/flux").json()["name"] == "FLUX"
    res = client.get("/api/v1/models/missing")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "not_found"
