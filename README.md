# MCP Testing Notes App

Backend and frontend playground for a simple notes application used to exercise MCP + GitHub workflows.

## Tech stack
- **Backend:** FastAPI (Python), SQLite via SQLAlchemy, pytest for tests
- **Frontend:** Next.js (TypeScript) – to be implemented separately

## User stories

### US1 – Create a note
As a user, I want to create a note with a title and optional body so I can capture ideas.
- API can create a note with a non-empty title
- Returns note with ID and timestamps
- Validation errors return 422 with clear messages

### US2 – List notes
As a user, I want to see my notes in a list so I can quickly scan what I have.
- API lists notes ordered by most recently updated
- Supports pagination via `limit` and `offset` query params
- Returns empty list gracefully when there are no notes

### US3 – View a single note
As a user, I want to open a specific note so I can read its full contents.
- API returns a note by ID
- Returns 404 JSON error when note does not exist

### US4 – Update and delete notes
As a user, I want to update or delete notes so I can keep my list relevant.
- API can update a note title and/or body with validation
- API can delete a note permanently
- Returns appropriate status codes for success and 404 when note does not exist
