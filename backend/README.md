# Backend – FastAPI Notes API

This folder contains the FastAPI backend for the MCP Testing Notes App.

## Requirements
- Python 3.11+
- [uv](https://github.com/astral-sh/uv) as the Python package manager

## Setup & Run

```bash
# Install dependencies
uv sync

# Run the API
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

CORS is configured to allow a future Next.js frontend at `http://localhost:3000`.

## Key endpoints

All endpoints are under the `/api/notes` base path.

- `POST /api/notes` – Create a note
- `GET /api/notes` – List notes with `limit` and `offset`
- `GET /api/notes/{id}` – Get a note by ID
- `PATCH /api/notes/{id}` – Update a note
- `DELETE /api/notes/{id}` – Delete a note
