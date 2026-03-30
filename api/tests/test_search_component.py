# Run from api/: pytest -q
import json
from pathlib import Path
from fastapi.testclient import TestClient
from src.main import app

_REPO_ROOT = Path(__file__).resolve().parent
_EMBEDDING_PATH = _REPO_ROOT / "test_embedding.json"

client = TestClient(app)

def test_search_returns_three_results():
    embedding = json.loads(_EMBEDDING_PATH.read_text())
    response = client.post("/search", json={"embedding": embedding})

    assert response.status_code == 200
    results = response.json()
    assert len(results) == 3

def test_search_top_result_is_50_cent():
    embedding = json.loads(_EMBEDDING_PATH.read_text())
    response = client.post("/search", json={"embedding": embedding})

    assert response.status_code == 200
    top = response.json()[0]
    assert top["name"] == "50 Cent"
    assert top["category"] == "celebrity"
    assert top["similarity"] > 0.999
    assert top["image_url"]

def test_search_rejects_wrong_embedding_length():
    response = client.post("/search", json={"embedding": [0.1, 0.2, 0.3]})
    assert response.status_code == 422
