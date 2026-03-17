export interface Note {
  id: number;
  title: string;
  body?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface NotesListResponse {
  items: Note[];
  meta: PaginationMeta;
}

export interface NoteCreate {
  title: string;
  body?: string;
}

export interface NoteUpdate {
  title?: string;
  body?: string;
}
