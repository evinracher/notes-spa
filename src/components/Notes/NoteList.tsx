import Note from './Note'
import type { NoteListProps } from '../../types/note'
import styles from './NoteList.module.css'

function NoteList({ notes, onResize, onMove, onDrop, onDragCancel }: NoteListProps) {
  return (
    <ul className={styles.list}>
      {notes.map((note) => (
        <li className={styles.item} key={note.id} style={{ left: note.x, top: note.y }}>
          <Note
            note={note}
            onResize={(size) => onResize(note.id, size)}
            onMove={(position) => onMove(note.id, position)}
            onDrop={(position) => onDrop(note.id, position)}
            onDragCancel={onDragCancel}
          />
        </li>
      ))}
    </ul>
  )
}

export default NoteList
