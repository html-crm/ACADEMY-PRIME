from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


def paginate(query_result: list, total: int, page: int, page_size: int) -> Page:
    return Page(items=query_result, total=total, page=page, page_size=page_size)
