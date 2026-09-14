import Note from './Note'
import type { NoteData } from '../notes'

type NoteListProps = {
  notes: NoteData[]
}

function NoteList({ notes }: NoteListProps) {
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id} style={{ left: note.x, top: note.y }}>
          <Note text={note.text} />
        </li>
      ))}
    </ul>
  )
}

export default NoteList
