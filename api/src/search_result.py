from pydantic import BaseModel
from .category import Category

class SearchResult(BaseModel):
    similarity: float
    name: str
    image_url: str
    category: Category = Category.CELEBRITY
