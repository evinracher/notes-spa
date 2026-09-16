import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import { loadNotes, NOTES_STORAGE_KEY } from '../utils/notesStorage'
import { DEFAULT_NOTE_COLOR, DEFAULT_TEXT_COLOR, MIN_NOTE_SIZE } from '../constants'
import type { NoteData, NoteDraft, NotePosition } from '../types/note'
import { NoteList } from './Notes'
import { Toolbar } from './Toolbar'
import styles from './Board.module.css'

function Board() {
  const [notes, setNotes] = useState(loadNotes)
  const [newNoteColor, setNewNoteColor] = useState(DEFAULT_NOTE_COLOR)
  const [newTextColor, setNewTextColor] = useState(DEFAULT_TEXT_COLOR)
  const [isCreating, setIsCreating] = useState(false)
  const [draftNote, setDraftNote] = useState<NoteDraft | null>(null)
  const creationStart = useRef<(NotePosition & {
    startedAt: number
    pointerId: number
    clientX: number
    clientY: number
  }) | null>(null)
  const [trashNoteId, setTrashNoteId] = useState<string | null>(null)
  const [storageError, setStorageError] = useState(false)
  const isOverTrash = trashNoteId !== null
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const placementButtonRef = useRef<HTMLButtonElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const trashRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function saveNotes() {
      try {
        if (notes.length === 0) localStorage.removeItem(NOTES_STORAGE_KEY)
        else localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
        setStorageError(false)
      } catch {
        setStorageError(true)
      }
    }

    const timeout = window.setTimeout(saveNotes, 200)
    window.addEventListener('pagehide', saveNotes)
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('pagehide', saveNotes)
    }
  }, [notes])

  useEffect(() => {
    const button = isCreating ? placementButtonRef.current : createButtonRef.current
    button?.focus()
  }, [isCreating])

  function createNote(bounds: NoteDraft) {
    const note: NoteData = {
      id: crypto.randomUUID(),
      text: '',
      color: newNoteColor,
      textColor: newTextColor,
      ...bounds,
    }

    setNotes((currentNotes) => [...currentNotes, note])
    setIsCreating(false)
    clearDraft()
  }

  function handlePlaceNote(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail !== 0) return

    const board = event.currentTarget
    createNote({
      x: (board.clientWidth - 200) / 2,
      y: (board.clientHeight - 200) / 2,
      size: { width: 200, height: 200 },
    })
  }

  function getCreationBounds(board: HTMLButtonElement, finalize = false): NoteDraft | null {
    const start = creationStart.current
    if (!start || !board.hasPointerCapture(start.pointerId)) return null

    const bounds = board.getBoundingClientRect()
    const x = Math.max(0, Math.min(start.clientX - bounds.left, board.clientWidth))
    const y = Math.max(0, Math.min(start.clientY - bounds.top, board.clientHeight))
    const dx = x - start.x
    const dy = y - start.y
    const isQuickClick = finalize && performance.now() - start.startedAt < 200
    const minimumSize = finalize ? MIN_NOTE_SIZE : 0
    const width = isQuickClick ? 200 : Math.max(minimumSize, Math.abs(dx))
    const height = isQuickClick ? 200 : Math.max(minimumSize, Math.abs(dy))

    return {
      x: Math.max(0, Math.min(!isQuickClick && dx < 0 ? start.x - width : start.x, board.clientWidth - width)),
      y: Math.max(0, Math.min(!isQuickClick && dy < 0 ? start.y - height : start.y, board.clientHeight - height)),
      size: { width, height },
    }
  }

  function handleCreationStart(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || !event.isPrimary || creationStart.current) return

    event.preventDefault()
    const board = event.currentTarget
    const bounds = board.getBoundingClientRect()
    creationStart.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      startedAt: performance.now(),
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    }
    board.setPointerCapture(event.pointerId)
    setDraftNote(getCreationBounds(board))
  }

  function handleCreationMove(event: PointerEvent<HTMLButtonElement>) {
    const start = creationStart.current
    if (!start || event.pointerId !== start.pointerId) return

    start.clientX = event.clientX
    start.clientY = event.clientY
    const bounds = getCreationBounds(event.currentTarget)
    if (bounds) setDraftNote(bounds)
  }

  function handleCreationEnd(event: PointerEvent<HTMLButtonElement>) {
    const start = creationStart.current
    if (!start || event.pointerId !== start.pointerId) return

    start.clientX = event.clientX
    start.clientY = event.clientY
    const bounds = getCreationBounds(event.currentTarget, true)
    if (bounds) createNote(bounds)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function clearDraft() {
    creationStart.current = null
    setDraftNote(null)
  }

  function handleResizeNote(id: string, size: NoteData['size']) {
    const board = boardRef.current
    if (!board) return

    const boardWidth = board.clientWidth
    const boardHeight = board.clientHeight

    setNotes((currentNotes) =>
      currentNotes.map((note) => {
        if (note.id !== id) return note

        const width = Math.max(MIN_NOTE_SIZE, Math.min(boardWidth - note.x, size.width))
        const height = Math.max(MIN_NOTE_SIZE, Math.min(boardHeight - note.y, size.height))

        return { ...note, size: { width, height } }
      }),
    )
  }

  function handleMoveNote(id: string, position: NotePosition, drop = false) {
    const board = boardRef.current
    const trash = trashRef.current
    const note = notes.find((note) => note.id === id)
    if (!board || !trash || !note) return

    const x = Math.max(0, Math.min(position.x, board.clientWidth - note.size.width))
    const y = Math.max(0, Math.min(position.y, board.clientHeight - note.size.height))
    const boardBounds = board.getBoundingClientRect()
    const trashBounds = trash.getBoundingClientRect()
    const left = boardBounds.left + x
    const top = boardBounds.top + y
    const overlapsTrash =
      left < trashBounds.right &&
      left + note.size.width > trashBounds.left &&
      top < trashBounds.bottom &&
      top + note.size.height > trashBounds.top

    setTrashNoteId(!drop && overlapsTrash ? id : null)
    setNotes((currentNotes) =>
      drop && overlapsTrash
        ? currentNotes.filter((note) => note.id !== id)
        : currentNotes.map((note) => note.id === id ? { ...note, x, y } : note),
    )

    if (drop && overlapsTrash) createButtonRef.current?.focus()
  }

  function bringNoteForward(id: string, toFront = false) {
    setNotes((currentNotes) => {
      const index = currentNotes.findIndex((note) => note.id === id)
      if (index < 0 || index === currentNotes.length - 1) return currentNotes

      const reordered = [...currentNotes]
      const [note] = reordered.splice(index, 1)
      reordered.splice(toFront ? reordered.length : index + 1, 0, note)
      return reordered
    })
  }

  return (
    <>
      <Toolbar
        createButtonRef={createButtonRef}
        isCreating={isCreating}
        noteColor={newNoteColor}
        textColor={newTextColor}
        onCreate={() => setIsCreating(true)}
        onColorsChange={(noteColor, textColor) => {
          setNewNoteColor(noteColor)
          setNewTextColor(textColor)
        }}
      />
      {storageError && <p role="status">Notes could not be saved in this browser.</p>}
      <div ref={boardRef} className={styles.board}>
        <NoteList
          notes={notes}
          trashNoteId={trashNoteId}
          onTextChange={(id, text) => setNotes((currentNotes) =>
            currentNotes.map((note) => note.id === id ? { ...note, text } : note),
          )}
          onColorChange={(id, color) => setNotes((currentNotes) =>
            currentNotes.map((note) => note.id === id ? { ...note, color } : note),
          )}
          onTextColorChange={(id, textColor) => setNotes((currentNotes) =>
            currentNotes.map((note) => note.id === id ? { ...note, textColor } : note),
          )}
          onBringForward={(id) => bringNoteForward(id)}
          onBringToFront={(id) => bringNoteForward(id, true)}
          onResize={handleResizeNote}
          onMove={handleMoveNote}
          onDrop={(id, position) => handleMoveNote(id, position, true)}
          onDragCancel={() => setTrashNoteId(null)}
        />
        <div
          ref={trashRef}
          className={`${styles.trash}${isOverTrash ? ` ${styles.trashActive}` : ''}`}
          role="img"
          aria-label={isOverTrash ? 'Release to delete note' : 'Drop a note here to delete it'}
        >
          <FiTrash2 size={32} aria-hidden="true" />
        </div>
        {draftNote && (
          <div
            className={styles.preview}
            style={{
              left: draftNote.x,
              top: draftNote.y,
              width: draftNote.size.width,
              height: draftNote.size.height,
              backgroundColor: newNoteColor,
            }}
            aria-hidden="true"
          />
        )}
        {isCreating && (
          <button
            ref={placementButtonRef}
            type="button"
            className={styles.placement}
            aria-label="Release within 200 milliseconds for the default size, or hold longer and drag to resize. Press Enter or Space to place a note in the center."
            onClick={handlePlaceNote}
            onPointerDown={handleCreationStart}
            onPointerMove={handleCreationMove}
            onPointerUp={handleCreationEnd}
            onPointerCancel={clearDraft}
            onLostPointerCapture={clearDraft}
          />
        )}
      </div>
    </>
  )
}

export default Board
