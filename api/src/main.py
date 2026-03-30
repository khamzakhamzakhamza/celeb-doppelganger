import json
import uuid
import logging
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from .search_handler import SearchHandler
from .search_request import SearchRequest
from .search_result import SearchResult

logger = logging.getLogger("api")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Celeb doppelganger API",
    version="0.1.0"
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/search", response_model=list[SearchResult])
def search_closest(request: SearchRequest) -> list[SearchResult]:
    corr_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    logger.info("%s %s - Recieved search request", 
                now.isoformat(timespec="seconds"),
                corr_id)
    handler = SearchHandler()

    try: 
        celebs = handler.search(request)
        logger.info("%s %s - Celebs found %s",
                    now.isoformat(timespec="seconds"),
                    corr_id,
                    json.dumps([c.model_dump() for c in celebs]))
        return celebs 
    except Exception as ex:
        logger.error('%s %s - Error encountered %s',
                     now.isoformat(timespec="seconds"),
                     corr_id,
                     str(ex))
        raise HTTPException(status_code=500, detail="Something went wrong")
