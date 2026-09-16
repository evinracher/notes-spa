import { useEffect, useId, useRef, useState } from 'react'
import { FiMoreHorizontal } from 'react-icons/fi'
import type { NoteMenuProps } from '../../types/note'
import { getDefaultTextColor } from '../../utils/colors'
import ColorPicker from '../ColorPicker'
import styles from './Note.module.css'

function NoteMenu({ color, textColor, onColorChange, onTextColorChange, onBringForward, onBringToFront }: NoteMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!isOpen) return

    function handleOutsideClick(event: globalThis.PointerEvent) {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setIsOpen(false)
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  function changeOrder(action: () => void) {
    action()
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  return (
    <div
      ref={menuRef}
      onBlur={(event) => {
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false)
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.options}
        style={{ color: getDefaultTextColor(color) }}
        aria-label="Note options"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <FiMoreHorizontal size={20} aria-hidden="true" />
      </button>
      {isOpen && (
        <div id={menuId} className={styles.menu}>
          <div className={styles.menuItem}>
            <ColorPicker label="Change color" value={color} onChange={onColorChange} />
          </div>
          <div className={styles.menuItem}>
            <ColorPicker label="Text color" value={textColor} onChange={onTextColorChange} />
          </div>
          <button type="button" className={styles.menuItem} onClick={() => changeOrder(onBringForward)}>
            Bring forward
          </button>
          <button type="button" className={styles.menuItem} onClick={() => changeOrder(onBringToFront)}>
            Bring to front
          </button>
        </div>
      )}
    </div>
  )
}

export default NoteMenu
