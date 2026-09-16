import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import type { NoteData } from '../types/note'
import { loadNotes, NOTES_STORAGE_KEY } from './notesStorage'

const savedNote: NoteData = {
  id: 'saved-note',
  text: 'Remember this',
  color: '#aabbcc',
  textColor: '#123456',
  x: 120,
  y: 80,
  size: { width: 240, height: 180 },
}

beforeEach(() => localStorage.clear())

describe('loadNotes', () => {
  test('restores the text, color, position and size of saved notes', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([savedNote]))

    expect(loadNotes()).toEqual([savedNote])
  })

  test('preserves an empty list after all notes have been deleted', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, '[]')

    expect(loadNotes()).toEqual([])
  })

  test('returns no notes when there is no saved data', () => {
    expect(loadNotes()).toEqual([])
  })

  test('returns no notes when the saved JSON is malformed', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, '{broken')

    expect(loadNotes()).toEqual([])
  })

  test.each([
    ['a non-array value', { notes: [savedNote] }],
    ['a null note', [null]],
    ['a missing ID', [{ ...savedNote, id: undefined }]],
    ['non-string text', [{ ...savedNote, text: 42 }]],
    ['a missing color', [{ ...savedNote, color: undefined }]],
    ['a missing text color', [{ ...savedNote, textColor: undefined }]],
    ['an invalid color', [{ ...savedNote, color: 'red' }]],
    ['a non-string color', [{ ...savedNote, color: 42 }]],
    ['an invalid text color', [{ ...savedNote, textColor: 'red' }]],
    ['a non-string text color', [{ ...savedNote, textColor: 42 }]],
    ['a negative position', [{ ...savedNote, x: -1 }]],
    ['a non-numeric position', [{ ...savedNote, y: '80' }]],
    ['a non-finite position', [{ ...savedNote, x: Infinity }]],
    ['missing dimensions', [{ ...savedNote, size: null }]],
    ['width below the minimum', [{ ...savedNote, size: { width: 159, height: 180 } }]],
    ['height below the minimum', [{ ...savedNote, size: { width: 240, height: 159 } }]],
  ])('returns no notes for %s', (_description, value) => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(value))

    expect(loadNotes()).toEqual([])
  })

  test('returns no notes when local storage cannot be read', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage is blocked', 'SecurityError')
    })

    expect(loadNotes()).toEqual([])
  })

  test('reads only the current version of saved notes', () => {
    localStorage.setItem('sticky-notes', JSON.stringify([savedNote]))
    expect(loadNotes()).toEqual([])

    localStorage.setItem('sticky-notes-v1', JSON.stringify([savedNote]))
    expect(loadNotes()).toEqual([savedNote])
  })

  test('preserves the saved order of notes', () => {
    const notes = [{ ...savedNote, id: 'front-later' }, savedNote]
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))

    expect(loadNotes()).toEqual(notes)
  })

})
