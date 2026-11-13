from .conftest import IMAGE_FILE, VIDEO_FILE

URL = "/api/v1/generations/preview"


def image_payload(**overrides):
    payload = {
        "kind": "image",
        "model_id": "flux",
        "prompt": "A glass greenhouse at dusk",
        "aspect_ratio": "16:9",
        "resolution": "2k",
        "num_outputs": 2,
        "references": [IMAGE_FILE],
    }
    return {**payload, **overrides}


def test_image_preview_never_executes(client):
    res = client.post(URL, json=image_payload())
    assert res.status_code == 200
    body = res.json()
    assert body["executed"] is False
    assert body["status"] == "integration_disabled"
    assert body["message"] == "AI integrations are not connected yet."
    # 4 base × 1.75 (2k) × 2 outputs = 14
    assert body["estimated_cost"]["tokens"] == 14


def test_flags_on_without_adapter_still_disabled(client_with_flags_on):
    body = client_with_flags_on.post(URL, json=image_payload()).json()
    assert body["executed"] is False
    assert body["feature_status"] == "provider_not_configured"


def test_unsupported_aspect_ratio(client):
    res = client.post(URL, json=image_payload(aspect_ratio="5:7"))
    assert res.status_code == 422
    assert res.json()["error"]["details"][0]["field"] == "aspect_ratio"


def test_unknown_model(client):
    res = client.post(URL, json=image_payload(model_id="nope"))
    assert res.status_code == 422
    assert res.json()["error"]["details"][0]["field"] == "model_id"


def test_wrong_category(client):
    res = client.post(URL, json=image_payload(model_id="kling"))
    assert res.status_code == 422


def test_prompt_too_short(client):
    res = client.post(URL, json=image_payload(prompt="a"))
    assert res.status_code == 422
    assert res.json()["error"]["details"][0]["field"] == "prompt"


def test_rejects_unsupported_file_type(client):
    bad = {**IMAGE_FILE, "mime_type": "image/gif"}
    res = client.post(URL, json=image_payload(references=[bad]))
    assert res.status_code == 422


def test_negative_prompt_unsupported(client):
    res = client.post(URL, json=image_payload(model_id="gpt-image", resolution="hd", aspect_ratio="1:1", negative_prompt="blur"))
    assert res.status_code == 422


def test_video_preview_with_audio(client):
    payload = {
        "kind": "video",
        "mode": "text_to_video",
        "model_id": "kling",
        "prompt": "Drone shot over a foggy forest",
        "aspect_ratio": "16:9",
        "resolution": "1080p",
        "duration": 5,
        "audio": True,
    }
    body = client.post(URL, json=payload).json()
    # 6 × 1.8 × 5 = 54, + 2 × 5 audio = 64
    assert body["estimated_cost"]["tokens"] == 64


def test_image_to_video_requires_first_frame(client):
    payload = {
        "kind": "video",
        "mode": "image_to_video",
        "model_id": "kling",
        "prompt": "Animate this",
        "aspect_ratio": "16:9",
        "resolution": "720p",
        "duration": 5,
    }
    res = client.post(URL, json=payload)
    assert res.status_code == 422
    assert res.json()["error"]["details"][0]["field"] == "first_frame"


def test_video_invalid_duration(client):
    payload = {
        "kind": "video",
        "mode": "text_to_video",
        "model_id": "wan",
        "prompt": "City timelapse",
        "aspect_ratio": "16:9",
        "resolution": "720p",
        "duration": 10,
    }
    assert client.post(URL, json=payload).status_code == 422


def test_character_motion_transfer_requires_video(client):
    payload = {
        "kind": "character",
        "workflow": "motion_transfer",
        "model_id": "wan-animate",
        "character_name": "Nova",
        "aspect_ratio": "9:16",
        "resolution": "720p",
        "duration": 5,
        "references": [IMAGE_FILE],
    }
    assert client.post(URL, json=payload).status_code == 422
    payload["reference_video"] = VIDEO_FILE
    assert client.post(URL, json=payload).status_code == 200


def test_upscale_and_enhance(client):
    upscale = {"kind": "upscale", "model_id": "clarity-upscaler", "image": IMAGE_FILE, "scale": 4}
    assert client.post(URL, json=upscale).json()["estimated_cost"]["tokens"] == 4
    assert client.post(URL, json={**upscale, "model_id": "real-esrgan", "scale": 8}).status_code == 422

    enhance = {
        "kind": "video_enhance",
        "model_id": "video-upscale-pro",
        "video": VIDEO_FILE,
        "target_resolution": "4k",
        "target_fps": 60,
    }
    # 1 × 6.5s × 2.5 × 1.4 = 22.75 -> 23
    assert client.post(URL, json=enhance).json()["estimated_cost"]["tokens"] == 23


def test_unknown_kind(client):
    assert client.post(URL, json={"kind": "audio", "model_id": "x"}).status_code == 422
