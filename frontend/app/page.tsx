'use client';

import { useEffect, useMemo, useState } from 'react';
import { createNote, deleteNote, listNotes, updateNote } from '../lib/api';
import type { Note, NoteCreate, NoteUpdate } from '../lib/types';
import { formatDistanceToNow } from '../lib/time';

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingBody, setEditingBody] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await listNotes({ limit: 20, offset: 0 });
        if (!cancelled) {
          setNotes(data.items);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError('Failed to load notes. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError(null);

    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }

    const payload: NoteCreate = { title: title.trim(), body: body.trim() || undefined };

    try {
      setCreating(true);
      const newNote = await createNote(payload);
      setNotes((prev) => [newNote, ...prev]);
      setTitle('');
      setBody('');
      setError(null);
    } catch (err: any) {
      console.error(err);
      if (err?.status === 422) {
        setTitleError('Title must not be empty.');
      } else {
        setError('Failed to create note. Please try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (note: Note) => {
    const confirmed = window.confirm(`Delete note "${note.title}"?`);
    if (!confirmed) return;

    const previous = notes;
    setNotes((prev) => prev.filter((n) => n.id !== note.id));

    try {
      await deleteNote(note.id);
    } catch (err) {
      console.error(err);
      setError('Failed to delete note. Restoring previous state.');
      setNotes(previous);
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingBody(note.body ?? '');
    setTitleError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingBody('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) return;

    if (!editingTitle.trim()) {
      setTitleError('Title is required');
      return;
    }

    const payload: NoteUpdate = {
      title: editingTitle.trim(),
      body: editingBody.trim() || undefined,
    };

    const previous = notes;
    const optimistic = previous.map((n) =>
      n.id === editingId ? { ...n, ...payload, updated_at: new Date().toISOString() } : n,
    );
    setNotes(optimistic);

    try {
      setEditSaving(true);
      const updated = await updateNote(editingId, payload);
      setNotes((current) => current.map((n) => (n.id === updated.id ? updated : n)));
      cancelEditing();
      setError(null);
    } catch (err: any) {
      console.error(err);
      if (err?.status === 422) {
        setTitleError('Title must not be empty.');
      } else {
        setError('Failed to update note. Restoring previous state.');
      }
      setNotes(previous);
    } finally {
      setEditSaving(false);
    }
  };

  const hasNotes = notes.length > 0;

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)),
    [notes],
  );

  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-purple-200 sm:text-5xl">
            Purple Notes
          </h1>
          <p className="mt-3 text-sm text-purple-100/80 sm:text-base">
            Capture quick thoughts and ideas in a clean, purple-themed workspace.
          </p>
        </header>

        <section className="mb-10 rounded-2xl border border-purple-500/30 bg-slate-900/60 p-5 shadow-xl shadow-purple-900/40 backdrop-blur">
          <h2 className="mb-4 text-lg font-medium text-purple-100">New note</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-purple-100">
                Title <span className="text-purple-300">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-purple-500/40 bg-slate-950/60 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400"
                placeholder="e.g. Meeting notes"
                disabled={creating}
                aria-invalid={!!titleError}
                aria-describedby={titleError ? 'title-error' : undefined}
              />
              {titleError && (
                <p id="title-error" className="mt-1 text-xs text-rose-300">
                  {titleError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-purple-100">
                Details
              </label>
              <textarea
                id="body"
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 w-full rounded-lg border border-purple-500/40 bg-slate-950/60 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400"
                rows={4}
                placeholder="Optional description, checklist, or ideas..."
                disabled={creating}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">Title is required. Body is optional.</p>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-purple-900/40 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/60"
              >
                {creating ? 'Saving…' : 'Add note'}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-950/60 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <section aria-busy={loading} aria-live="polite">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium text-purple-100">Your notes</h2>
            {loading && (
              <span className="text-xs text-slate-400">Loading notes…</span>
            )}
          </div>

          {!loading && !hasNotes && (
            <p className="rounded-xl border border-dashed border-purple-500/30 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-300">
              You don&apos;t have any notes yet. Create your first note above.
            </p>
          )}

          {hasNotes && (
            <ul className="grid gap-4 sm:grid-cols-2">
              {sortedNotes.map((note) => {
                const isEditing = editingId === note.id;
                return (
                  <li
                    key={note.id}
                    className="group flex flex-col rounded-2xl border border-purple-500/30 bg-slate-900/70 p-4 shadow-lg shadow-purple-900/40 transition hover:border-purple-400/70 hover:shadow-purple-800/60"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      {isEditing ? (
                        <form onSubmit={handleSaveEdit} className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="w-full rounded-md border border-purple-500/40 bg-slate-950/60 px-2 py-1 text-sm font-medium"
                            autoFocus
                          />
                          <textarea
                            value={editingBody}
                            onChange={(e) => setEditingBody(e.target.value)}
                            className="w-full rounded-md border border-purple-500/40 bg-slate-950/60 px-2 py-1 text-xs text-slate-100"
                            rows={3}
                          />
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800/80"
                              disabled={editSaving}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={editSaving}
                              className="rounded-md bg-purple-500 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/60"
                            >
                              {editSaving ? 'Saving…' : 'Save'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-purple-50 line-clamp-2">
                            {note.title}
                          </h3>
                          {note.body && (
                            <p className="mt-1 text-xs text-slate-200 line-clamp-4 whitespace-pre-wrap">
                              {note.body}
                            </p>
                          )}
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            onClick={() => startEditing(note)}
                            className="rounded-full px-2 py-1 text-[11px] font-medium text-purple-100/90 hover:bg-purple-500/20 focus-visible:bg-purple-500/30"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(note)}
                            className="rounded-full px-2 py-1 text-[11px] font-medium text-rose-100/90 hover:bg-rose-500/20 focus-visible:bg-rose-500/30"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400">
                      <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-purple-200">
                        Updated {formatDistanceToNow(note.updated_at)} ago
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
