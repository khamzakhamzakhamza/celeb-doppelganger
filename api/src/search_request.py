from pydantic import BaseModel, Field
from .constants import EMBEDDING_DIM

class SearchRequest(BaseModel):
    embedding: list[float] = Field(
        ...,
        min_length=EMBEDDING_DIM,
        max_length=EMBEDDING_DIM,
    )
