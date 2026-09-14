export type NotePosition = { x: number; y: number }

export type NoteData = {
  id: string
  text: string
  x: number
  y: number
  size: {
    width: number
    height: number
  }
}

export type NoteProps = {
  note: NoteData
  onResize: (size: NoteData['size']) => void
  onMove: (position: NotePosition) => void
  onDrop: (position: NotePosition) => void
  onDragCancel: () => void
}

export type NoteListProps = {
  notes: NoteData[]
  onResize: (id: string, size: NoteData['size']) => void
  onMove: (id: string, position: NotePosition) => void
  onDrop: (id: string, position: NotePosition) => void
  onDragCancel: () => void
}
