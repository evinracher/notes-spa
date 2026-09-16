import type { NoteData } from '../types/note'
import { MIN_NOTE_SIZE } from '../constants'

export const NOTES_STORAGE_KEY = 'sticky-notes-v1'

function isNote(value: unknown): value is NoteData {
  if (typeof value !== 'object' || value === null) return false
  const note = value as Partial<NoteData>

  return (
    typeof note.id === 'string' &&
    typeof note.text === 'string' &&
    typeof note.color === 'string' && /^#[0-9a-f]{6}$/i.test(note.color) &&
    typeof note.textColor === 'string' && /^#[0-9a-f]{6}$/i.test(note.textColor) &&
    typeof note.x === 'number' && Number.isFinite(note.x) && note.x >= 0 &&
    typeof note.y === 'number' && Number.isFinite(note.y) && note.y >= 0 &&
    typeof note.size === 'object' && note.size !== null &&
    typeof note.size.width === 'number' && Number.isFinite(note.size.width) && note.size.width >= MIN_NOTE_SIZE &&
    typeof note.size.height === 'number' && Number.isFinite(note.size.height) && note.size.height >= MIN_NOTE_SIZE
  )
}

export function loadNotes(): NoteData[] {
  try {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY)
    if (saved === null) return []

    const notes: unknown = JSON.parse(saved)
    return Array.isArray(notes) && notes.every(isNote) ? notes : []
  } catch {
    return []
  }
}
