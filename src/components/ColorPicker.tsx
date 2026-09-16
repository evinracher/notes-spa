import type { ColorPickerProps } from '../types/colorPicker'
import styles from './ColorPicker.module.css'

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <label className={styles.picker}>
      {label}
      <span className={styles.swatch} style={{ backgroundColor: value }}>
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  )
}

export default ColorPicker
