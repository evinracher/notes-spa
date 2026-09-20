import type { Ref } from 'react'

export type ToolbarProps = {
  createButtonRef: Ref<HTMLButtonElement>
  isCreating: boolean
  noteColor: string
  textColor: string
  onCreate: () => void
  onRemoveAll?: () => void
  onColorsChange: (noteColor: string, textColor: string) => void
}
