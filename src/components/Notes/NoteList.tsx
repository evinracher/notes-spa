import Note from './Note'
import type { NoteListProps } from '../../types/note'
import styles from './NoteList.module.css'

function NoteList({ notes, trashNoteId, onTextChange, onColorChange, onTextColorChange, onBringForward, onBringToFront, onMoveBackward, onSendToBack, onResize, onMove, onDrop, onDragCancel }: NoteListProps) {
  return (
    <ul className={styles.list}>
      {notes.map((note) => (
        <li className={styles.item} key={note.id} style={{ left: note.x, top: note.y }}>
          <Note
            note={note}
            isOverTrash={note.id === trashNoteId}
            onTextChange={(text) => onTextChange(note.id, text)}
            onColorChange={(color) => onColorChange(note.id, color)}
            onTextColorChange={(color) => onTextColorChange(note.id, color)}
            onBringForward={() => onBringForward(note.id)}
            onBringToFront={() => onBringToFront(note.id)}
            onMoveBackward={() => onMoveBackward(note.id)}
            onSendToBack={() => onSendToBack(note.id)}
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
