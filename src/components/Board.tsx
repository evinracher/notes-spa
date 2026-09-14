import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import type { NoteData, NotePosition } from '../types/note'
import { NoteList } from './Notes'
import styles from './Board.module.css'

const initialNotes: NoteData[] = [
  { id: '1', text: 'First note', x: 16, y: 16, size: { width: 200, height: 200 } },
  { id: '2', text: 'Second note', x: 232, y: 16, size: { width: 200, height: 200 } },
  { id: '3', text: 'Third note', x: 448, y: 16, size: { width: 200, height: 200 } },
]

function Board() {
  const [notes, setNotes] = useState(initialNotes)
  const [isCreating, setIsCreating] = useState(false)
  const [isOverTrash, setIsOverTrash] = useState(false)
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const placementButtonRef = useRef<HTMLButtonElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const trashRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const button = isCreating ? placementButtonRef.current : createButtonRef.current
    button?.focus()
  }, [isCreating])

  function handlePlaceNote(event: MouseEvent<HTMLButtonElement>) {
    const board = event.currentTarget
    const bounds = board.getBoundingClientRect()
    const note: NoteData = {
      id: crypto.randomUUID(),
      text: 'New note',
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      size: { width: 200, height: 200 },
    }

    if (event.detail === 0) {
      note.x = (board.clientWidth - note.size.width) / 2
      note.y = (board.clientHeight - note.size.height) / 2
    }

    note.x = Math.max(
      0,
      Math.min(note.x, board.clientWidth - note.size.width),
    )
    note.y = Math.max(
      0,
      Math.min(note.y, board.clientHeight - note.size.height),
    )

    setNotes((currentNotes) => [...currentNotes, note])
    setIsCreating(false)
  }

  function handleResizeNote(id: string, size: NoteData['size']) {
    const board = boardRef.current
    if (!board) return

    const boardWidth = board.clientWidth
    const boardHeight = board.clientHeight

    setNotes((currentNotes) =>
      currentNotes.map((note) => {
        if (note.id !== id) return note

        const width = Math.max(100, Math.min(boardWidth - note.x, size.width))
        const height = Math.max(100, Math.min(boardHeight - note.y, size.height))

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

    setIsOverTrash(!drop && overlapsTrash)
    setNotes((currentNotes) =>
      drop && overlapsTrash
        ? currentNotes.filter((note) => note.id !== id)
        : currentNotes.map((note) => note.id === id ? { ...note, x, y } : note),
    )

    if (drop && overlapsTrash) createButtonRef.current?.focus()
  }

  return (
    <>
      <button
        ref={createButtonRef}
        className={styles.createButton}
        type="button"
        disabled={isCreating}
        onClick={() => setIsCreating(true)}
      >
        {isCreating ? 'Click the board to place note' : 'Create note'}
      </button>
      <div ref={boardRef} className={styles.board}>
        <NoteList
          notes={notes}
          onResize={handleResizeNote}
          onMove={handleMoveNote}
          onDrop={(id, position) => handleMoveNote(id, position, true)}
          onDragCancel={() => setIsOverTrash(false)}
        />
        <div
          ref={trashRef}
          className={`${styles.trash}${isOverTrash ? ` ${styles.trashActive}` : ''}`}
          role="img"
          aria-label={isOverTrash ? 'Release to delete note' : 'Drop a note here to delete it'}
        >
          <FiTrash2 size={32} aria-hidden="true" />
        </div>
        {isCreating && (
          <button
            ref={placementButtonRef}
            type="button"
            className={styles.placement}
            aria-label="Click or tap to place a note. Press Enter or Space to place it in the center."
            onClick={handlePlaceNote}
          />
        )}
      </div>
    </>
  )
}

export default Board
