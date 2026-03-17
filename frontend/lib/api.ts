import type { Note, NoteCreate, NoteUpdate, NotesListResponse } from './types';

const API_BASE_URL = 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error: any = new Error('Request failed');
    error.status = res.status;
    try {
      error.body = await res.json();
    } catch {
      // ignore
    }
    throw error;
  }
  return res.json() as Promise<T>;
}

export async function listNotes(params: { limit: number; offset: number }): Promise<NotesListResponse> {
  const url = new URL('/api/notes', API_BASE_URL);
  url.searchParams.set('limit', String(params.limit));
  url.searchParams.set('offset', String(params.offset));

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  return handleResponse<NotesListResponse>(res);
}

export async function createNote(payload: NoteCreate): Promise<Note> {
  const res = await fetch(`${API_BASE_URL}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Note>(res);
}

export async function deleteNote(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const error: any = new Error('Request failed');
    error.status = res.status;
    throw error;
  }
}

export async function updateNote(id: number, payload: NoteUpdate): Promise<Note> {
  const res = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Note>(res);
}
