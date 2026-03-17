from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import notes as notes_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MCP Testing Notes API")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes_router.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
