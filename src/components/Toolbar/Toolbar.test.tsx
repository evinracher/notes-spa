import { createRef } from 'react'
import { expect, jest, test } from '@jest/globals'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEFAULT_NOTE_COLOR, DEFAULT_TEXT_COLOR } from '../../constants'
import type { ToolbarProps } from '../../types/toolbar'
import Toolbar from './Toolbar'

function renderToolbar(overrides: Partial<ToolbarProps> = {}) {
  const createButtonRef = createRef<HTMLButtonElement>()
  const props: ToolbarProps = {
    createButtonRef,
    isCreating: false,
    noteColor: DEFAULT_NOTE_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
    onCreate: jest.fn(),
    onColorsChange: jest.fn(),
    ...overrides,
  }

  return { ...render(<Toolbar {...props} />), props, createButtonRef }
}

test('allows the board to focus the create button and create a note with the keyboard', async () => {
  const user = userEvent.setup()
  const { props, createButtonRef } = renderToolbar()

  act(() => createButtonRef.current?.focus())
  expect(screen.getByRole('button', { name: 'Create note' })).toHaveFocus()
  await user.keyboard('{Enter}')

  expect(props.onCreate).toHaveBeenCalledTimes(1)
  expect(props.onColorsChange).not.toHaveBeenCalled()
})

test('disables creation while placing a note and enables it again afterwards', async () => {
  const user = userEvent.setup()
  const { props, rerender } = renderToolbar({ isCreating: true })
  const button = screen.getByRole('button', { name: 'Click to place or hold to resize' })

  expect(button).toBeDisabled()
  await user.click(button)
  expect(props.onCreate).not.toHaveBeenCalled()
  rerender(<Toolbar {...props} isCreating={false} />)
  await user.click(screen.getByRole('button', { name: 'Create note' }))

  expect(props.onCreate).toHaveBeenCalledTimes(1)
})

test.each([
  ['#121212', '#ffffff'],
  ['#ffffcc', DEFAULT_TEXT_COLOR],
])('selects a contrasting text color when the background becomes %s', (background, textColor) => {
  const { props } = renderToolbar()

  fireEvent.change(screen.getByLabelText('New note color'), { target: { value: background } })

  expect(props.onColorsChange).toHaveBeenLastCalledWith(background, textColor)
  expect(props.onCreate).not.toHaveBeenCalled()
})

test('keeps a manual text color through background changes and a creation cycle', () => {
  const { props, rerender } = renderToolbar()
  fireEvent.change(screen.getByLabelText('New text color'), { target: { value: '#ccffaa' } })
  expect(props.onColorsChange).toHaveBeenLastCalledWith(DEFAULT_NOTE_COLOR, '#ccffaa')

  rerender(<Toolbar {...props} textColor="#ccffaa" />)
  fireEvent.change(screen.getByLabelText('New note color'), { target: { value: '#000000' } })
  expect(props.onColorsChange).toHaveBeenLastCalledWith('#000000', '#ccffaa')

  rerender(<Toolbar {...props} noteColor="#000000" textColor="#ccffaa" isCreating />)
  rerender(<Toolbar {...props} noteColor="#000000" textColor="#ccffaa" />)
  fireEvent.change(screen.getByLabelText('New note color'), { target: { value: '#ffffff' } })
  expect(props.onColorsChange).toHaveBeenLastCalledWith('#ffffff', '#ccffaa')
})

test('resets both colors and re-enables automatic text contrast', async () => {
  const user = userEvent.setup()
  const { props, rerender } = renderToolbar({ noteColor: '#000000', textColor: '#ffffff' })
  fireEvent.change(screen.getByLabelText('New text color'), { target: { value: '#ccffaa' } })
  rerender(<Toolbar {...props} textColor="#ccffaa" />)
  await user.click(screen.getByRole('button', { name: 'Reset colors' }))

  expect(props.onColorsChange).toHaveBeenLastCalledWith(DEFAULT_NOTE_COLOR, DEFAULT_TEXT_COLOR)
  rerender(<Toolbar {...props} noteColor={DEFAULT_NOTE_COLOR} textColor={DEFAULT_TEXT_COLOR} />)
  expect(screen.getByLabelText('New note color')).toHaveValue(DEFAULT_NOTE_COLOR)
  expect(screen.getByLabelText('New text color')).toHaveValue(DEFAULT_TEXT_COLOR)
  fireEvent.change(screen.getByLabelText('New note color'), { target: { value: '#000000' } })

  expect(props.onColorsChange).toHaveBeenLastCalledWith('#000000', '#ffffff')
  expect(props.onCreate).not.toHaveBeenCalled()
})
