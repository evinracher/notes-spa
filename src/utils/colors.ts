import { DEFAULT_TEXT_COLOR } from '../constants'

export function getDefaultTextColor(background: string): string {
  const red = parseInt(background.slice(1, 3), 16)
  const green = parseInt(background.slice(3, 5), 16)
  const blue = parseInt(background.slice(5, 7), 16)
  const brightness = red * 0.299 + green * 0.587 + blue * 0.114
  return brightness < 128 ? '#ffffff' : DEFAULT_TEXT_COLOR
}
