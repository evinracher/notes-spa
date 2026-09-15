import type { NoteData } from './types/note'

export const NOTES_STORAGE_KEY = 'sticky-notes'

function isNote(value: unknown): value is NoteData {
  if (typeof value !== 'object' || value === null) return false
  const note = value as Partial<NoteData>

  return (
    typeof note.id === 'string' &&
    typeof note.text === 'string' &&
    typeof note.x === 'number' && Number.isFinite(note.x) && note.x >= 0 &&
    typeof note.y === 'number' && Number.isFinite(note.y) && note.y >= 0 &&
    typeof note.size === 'object' && note.size !== null &&
    typeof note.size.width === 'number' && Number.isFinite(note.size.width) && note.size.width >= 100 &&
    typeof note.size.height === 'number' && Number.isFinite(note.size.height) && note.size.height >= 100
  )
}

export function loadNotes(fallback: NoteData[]): NoteData[] {
  try {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY)
    if (saved === null) return fallback

    const notes: unknown = JSON.parse(saved)
    return Array.isArray(notes) && notes.every(isNote) ? notes : fallback
  } catch {
    return fallback
  }
}
