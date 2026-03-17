# Purple Notes Frontend

This is the Next.js + TypeScript frontend for the Purple Notes app.

## Tech stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

## Getting started

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the backend API (from the project root):

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. In a separate terminal, start the frontend dev server:

```bash
cd frontend
npm run dev
```

The app will be available at http://localhost:3000 and expects the backend at http://localhost:8000.
