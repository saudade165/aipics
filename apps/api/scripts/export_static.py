"""Dump read-only API responses to JSON for static hosting (e.g. GitHub Pages).

Usage: python scripts/export_static.py <output_dir>
"""

import json
import sys
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

ENDPOINTS = ("config", "features", "models", "pricing")


def main(output_dir: str) -> None:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    client = TestClient(app)
    for name in ENDPOINTS:
        response = client.get(f"/api/v1/{name}")
        response.raise_for_status()
        (out / f"{name}.json").write_text(json.dumps(response.json(), ensure_ascii=False), encoding="utf-8")
        print(f"wrote {out / name}.json")


if __name__ == "__main__":
    main(sys.argv[1])
