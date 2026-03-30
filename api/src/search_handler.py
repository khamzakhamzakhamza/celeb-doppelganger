import json
import faiss
import numpy as np
from pathlib import Path
from .category import Category
from .search_request import SearchRequest
from .search_result import SearchResult

STATIC_DIR = Path(__file__).resolve().parent / "static_data"
INDEX_PATH = STATIC_DIR / "celebs.faiss"
META_PATH = STATIC_DIR / "celebs_meta.json"
SEARCH_COUNT = 3

class SearchHandler:
    def __init__(self):
        self.index = faiss.read_index(str(INDEX_PATH))
        with META_PATH.open() as f:
            self.meta = json.load(f)
    
    def search(self, request: SearchRequest) -> list[SearchResult]:
        celebs: list[SearchResult] = []

        q = np.asarray(request.embedding, dtype=np.float32).reshape(1, -1)
        faiss.normalize_L2(q)
        scores, ids = self.index.search(q, SEARCH_COUNT)

        query_id = 0
        for i in range(len(scores[query_id])):
            score = float(scores[query_id][i])
            id = int(ids[query_id][i])
            
            meta = self.meta[id]
            celebs.append(SearchResult(
                similarity=score,
                name=meta.get('name'),
                image_url=meta.get('image_url'),
                category=Category.CELEBRITY))
        
        return celebs
