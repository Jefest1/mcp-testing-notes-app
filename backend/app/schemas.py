from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class NoteBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    body: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not v.strip():
            raise ValueError("title must not be empty")
        return v


class NoteCreate(NoteBase):
    title: str = Field(..., max_length=255)


class NoteUpdate(NoteBase):
    pass


class NoteRead(BaseModel):
    id: int
    title: str
    body: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginationMeta(BaseModel):
    total: int
    limit: int
    offset: int


class NotesListResponse(BaseModel):
    items: List[NoteRead]
    pagination: PaginationMeta
