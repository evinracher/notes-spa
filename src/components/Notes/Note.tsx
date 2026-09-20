import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import type { NoteData, NotePosition, NoteProps } from '../../types/note'
import { getDefaultTextColor } from '../../utils/colors'
import NoteMenu from './NoteMenu'
import styles from './Note.module.css'

function Note({ note, isOverTrash, onTextChange, onColorChange, onTextColorChange, onBringForward, onBringToFront, onMoveBackward, onSendToBack, onResize, onMove, onDrop, onDragCancel }: NoteProps) {
  const { text, size } = note
  const [isEditing, setIsEditing] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const dragStart = useRef<{
    clientX: number
    clientY: number
    position: NotePosition
    moved: boolean
  } | null>(null)
  const resizeStart = useRef<{
    x: number
    y: number
    size: NoteData['size']
  } | null>(null)

  useLayoutEffect(() => {
    const textarea = textRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.overflowY = 'hidden'
    // Leave one pixel for browsers that round fractional line heights.
    textarea.style.height = `${Math.min(textarea.scrollHeight + 1, size.height - 48)}px`
    textarea.style.overflowY = 'auto'
  }, [text, size.width, size.height])

  function handleDragStart(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || !event.isPrimary) return

    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      position: { x: note.x, y: note.y },
      moved: false,
    }
  }

  function getDragPosition(event: PointerEvent<HTMLButtonElement>) {
    const start = dragStart.current
    if (!start || !event.currentTarget.hasPointerCapture(event.pointerId)) return

    const dx = event.clientX - start.clientX
    const dy = event.clientY - start.clientY
    if (!start.moved && Math.hypot(dx, dy) < 4) return

    start.moved = true
    return { x: start.position.x + dx, y: start.position.y + dy }
  }

  function handleDragMove(event: PointerEvent<HTMLButtonElement>) {
    const position = getDragPosition(event)
    if (position) onMove(position)
  }

  function handleDragCancel() {
    dragStart.current = null
    onDragCancel()
  }

  function handleDragEnd(event: PointerEvent<HTMLButtonElement>) {
    const position = getDragPosition(event)
    if (position) onDrop(position)

    handleDragCancel()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleMoveKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const position = { x: note.x, y: note.y }

    switch (event.key) {
      case 'ArrowLeft':
        position.x -= 10
        break
      case 'ArrowRight':
        position.x += 10
        break
      case 'ArrowUp':
        position.y -= 10
        break
      case 'ArrowDown':
        position.y += 10
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onDrop(position)
        return
      case 'Escape':
        handleDragCancel()
        return
      default:
        return
    }

    event.preventDefault()
    onMove(position)
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || !event.isPrimary) return

    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture(event.pointerId)
    resizeStart.current = { x: event.clientX, y: event.clientY, size }
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const start = resizeStart.current
    if (!start || !event.currentTarget.hasPointerCapture(event.pointerId)) return

    onResize({
      width: start.size.width + (event.clientX - start.x),
      height: start.size.height + (event.clientY - start.y),
    })
  }

  function handlePointerEnd(event: PointerEvent<HTMLButtonElement>) {
    resizeStart.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const nextSize = { ...size }

    switch (event.key) {
      case 'ArrowLeft':
        nextSize.width -= 10
        break
      case 'ArrowRight':
        nextSize.width += 10
        break
      case 'ArrowUp':
        nextSize.height -= 10
        break
      case 'ArrowDown':
        nextSize.height += 10
        break
      default:
        return
    }

    event.preventDefault()
    onResize(nextSize)
  }

  return (
    <div
      className={`${styles.note}${isOverTrash ? ` ${styles.overTrash}` : ''}`}
      style={{ width: size.width, height: size.height, backgroundColor: isOverTrash ? undefined : note.color, color: note.textColor }}
    >
      <button
        type="button"
        className={styles.drag}
        aria-label={`${text || 'Empty note'}. Drag or use arrow keys to move. Press Enter to drop.`}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragCancel}
        onLostPointerCapture={handleDragCancel}
        onKeyDown={handleMoveKeyDown}
        onBlur={handleDragCancel}
      />
      <textarea
        ref={textRef}
        className={styles.text}
        aria-label="Note text"
        placeholder="Click to edit note text"
        value={text}
        rows={1}
        readOnly={!isEditing}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        onChange={(event) => onTextChange(event.target.value)}
      />
      <button
        type="button"
        className={styles.resize}
        style={{ color: getDefaultTextColor(note.color) }}
        aria-label="Resize note. Drag or use the arrow keys."
        title="Resize note"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={() => {
          resizeStart.current = null
        }}
        onKeyDown={handleKeyDown}
      />
      <NoteMenu
        color={note.color}
        textColor={note.textColor}
        onColorChange={onColorChange}
        onTextColorChange={onTextColorChange}
        onBringForward={onBringForward}
        onBringToFront={onBringToFront}
        onMoveBackward={onMoveBackward}
        onSendToBack={onSendToBack}
      />
    </div>
  )
}

export default Note
