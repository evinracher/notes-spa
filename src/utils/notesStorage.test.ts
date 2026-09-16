import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import type { NoteData } from '../types/note'
import { loadNotes, NOTES_STORAGE_KEY } from './notesStorage'

const savedNote: NoteData = {
  id: 'saved-note',
  text: 'Remember this',
  x: 120,
  y: 80,
  size: { width: 240, height: 180 },
}
const initialNotes: NoteData[] = [{ ...savedNote, id: 'initial-note', text: 'Initial note' }]

beforeEach(() => localStorage.clear())

describe('loadNotes', () => {
  test('restores the text, position and size of saved notes', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([savedNote]))

    expect(loadNotes(initialNotes)).toEqual([savedNote])
  })

  test('preserves an empty list after all notes have been deleted', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, '[]')

    expect(loadNotes(initialNotes)).toEqual([])
  })

  test('uses initial notes when there is no saved data', () => {
    expect(loadNotes(initialNotes)).toEqual(initialNotes)
  })

  test('uses initial notes when the saved JSON is malformed', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, '{broken')

    expect(loadNotes(initialNotes)).toEqual(initialNotes)
  })

  test.each([
    ['a non-array value', { notes: [savedNote] }],
    ['a null note', [null]],
    ['a missing ID', [{ ...savedNote, id: undefined }]],
    ['non-string text', [{ ...savedNote, text: 42 }]],
    ['a negative position', [{ ...savedNote, x: -1 }]],
    ['a non-numeric position', [{ ...savedNote, y: '80' }]],
    ['a non-finite position', [{ ...savedNote, x: Infinity }]],
    ['missing dimensions', [{ ...savedNote, size: null }]],
    ['width below the minimum', [{ ...savedNote, size: { width: 99, height: 180 } }]],
    ['height below the minimum', [{ ...savedNote, size: { width: 240, height: 99 } }]],
  ])('uses initial notes for %s', (_description, value) => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(value))

    expect(loadNotes(initialNotes)).toEqual(initialNotes)
  })

  test('uses initial notes when local storage cannot be read', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage is blocked', 'SecurityError')
    })

    expect(loadNotes(initialNotes)).toEqual(initialNotes)
  })
})
