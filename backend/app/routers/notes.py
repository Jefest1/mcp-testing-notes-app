from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_session
from ..models import Note
from ..schemas import NoteCreate, NoteRead, NoteUpdate, NotesListResponse, PaginationMeta

router = APIRouter(prefix="/api/notes", tags=["notes"])


def get_db() -> Session:
    with get_session() as session:
        yield session


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)) -> NoteRead:
    note = Note(title=payload.title.strip(), body=payload.body or "")
    db.add(note)
    db.flush()
    db.refresh(note)
    return note


@router.get("", response_model=NotesListResponse)
def list_notes(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> NotesListResponse:
    total = db.scalar(select(func.count()).select_from(Note)) or 0
    stmt = (
        select(Note)
        .order_by(Note.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )
    items: List[Note] = list(db.scalars(stmt).all())
    return NotesListResponse(
        items=items,
        pagination=PaginationMeta(total=total, limit=limit, offset=offset),
    )


@router.get("/{note_id}", response_model=NoteRead)
def get_note(note_id: int, db: Session = Depends(get_db)) -> NoteRead:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Note not found", "note_id": note_id},
        )
    return note


@router.patch("/{note_id}", response_model=NoteRead)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
) -> NoteRead:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Note not found", "note_id": note_id},
        )

    update_data = payload.model_dump(exclude_unset=True)
    if "title" in update_data and update_data["title"] is not None:
        note.title = update_data["title"].strip()
    if "body" in update_data and update_data["body"] is not None:
        note.body = update_data["body"]

    db.add(note)
    db.flush()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)) -> None:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Note not found", "note_id": note_id},
        )
    db.delete(note)
    db.flush()
