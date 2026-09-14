import { NOTE_SIZE } from '../notes'

type NoteProps = {
  text: string
}

function Note({ text }: NoteProps) {
  return (
    <p className="note" style={{ width: NOTE_SIZE, height: NOTE_SIZE }}>
      {text}
    </p>
  )
}

export default Note
