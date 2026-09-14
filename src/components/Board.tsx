import { useState } from 'react'
import type { MouseEvent } from 'react'
import { NOTE_SIZE } from '../notes'
import type { NoteData } from '../notes'
import NoteList from './NoteList'

const initialNotes: NoteData[] = [
  { id: '1', text: 'First note', x: 16, y: 16 },
  { id: '2', text: 'Second note', x: 232, y: 16 },
  { id: '3', text: 'Third note', x: 448, y: 16 },
]

function Board() {
  const [notes, setNotes] = useState(initialNotes)
  const [isCreating, setIsCreating] = useState(false)

  function handleBoardClick(event: MouseEvent<HTMLDivElement>) {
    if (!isCreating) return

    const board = event.currentTarget
    const bounds = board.getBoundingClientRect()
    const x = Math.max(
      0,
      Math.min(event.clientX - bounds.left, board.clientWidth - NOTE_SIZE),
    )
    const y = Math.max(
      0,
      Math.min(event.clientY - bounds.top, board.clientHeight - NOTE_SIZE),
    )
    const note: NoteData = { id: crypto.randomUUID(), text: 'New note', x, y }

    setNotes((currentNotes) => [...currentNotes, note])
    setIsCreating(false)
  }

  return (
    <>
      <button
        type="button"
        disabled={isCreating}
        onClick={() => setIsCreating(true)}
      >
        {isCreating ? 'Click the board to place note' : 'Create note'}
      </button>
      <div
        className={`board${isCreating ? ' board-creating' : ''}`}
        onClick={handleBoardClick}
      >
        <NoteList notes={notes} />
      </div>
    </>
  )
}

export default Board
