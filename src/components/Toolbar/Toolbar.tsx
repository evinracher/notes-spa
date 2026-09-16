import { useState } from 'react'
import { DEFAULT_NOTE_COLOR, DEFAULT_TEXT_COLOR } from '../../constants'
import type { ToolbarProps } from '../../types/toolbar'
import { getDefaultTextColor } from '../../utils/colors'
import ColorPicker from '../ColorPicker'
import styles from './Toolbar.module.css'

function Toolbar({ createButtonRef, isCreating, noteColor, textColor, onCreate, onColorsChange }: ToolbarProps) {
  const [hasCustomTextColor, setHasCustomTextColor] = useState(false)

  return (
    <div className={styles.toolbar}>
      <button
        ref={createButtonRef}
        className={styles.createButton}
        type="button"
        disabled={isCreating}
        onClick={onCreate}
      >
        {isCreating ? 'Click to place or hold to resize' : 'Create note'}
      </button>
      <ColorPicker
        label="New note color"
        value={noteColor}
        onChange={(color) => onColorsChange(color, hasCustomTextColor ? textColor : getDefaultTextColor(color))}
      />
      <ColorPicker
        label="New text color"
        value={textColor}
        onChange={(color) => {
          onColorsChange(noteColor, color)
          setHasCustomTextColor(true)
        }}
      />
      <button
        type="button"
        className={styles.resetColors}
        onClick={() => {
          onColorsChange(DEFAULT_NOTE_COLOR, DEFAULT_TEXT_COLOR)
          setHasCustomTextColor(false)
        }}
      >
        Reset colors
      </button>
    </div>
  )
}

export default Toolbar
