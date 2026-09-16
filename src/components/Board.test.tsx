import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NOTES_STORAGE_KEY } from '../utils/notesStorage'
import Board from './Board'

function setBounds(element: HTMLElement, x: number, y: number, width: number, height: number) {
  Object.defineProperties(element, {
    clientWidth: { configurable: true, value: width },
    clientHeight: { configurable: true, value: height },
  })
  jest.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(x, y, width, height))
}

function renderBoard() {
  const result = render(<Board />)
  const board = screen.getByRole('list').parentElement!
  // Non-zero offsets catch confusion between viewport and board coordinates.
  setBounds(board, 40, 80, 1000, 700)
  setBounds(screen.getByRole('img', { name: 'Drop a note here to delete it' }), 960, 380, 64, 64)
  return { ...result, board }
}

function startCreation() {
  fireEvent.click(screen.getByRole('button', { name: 'Create note' }))
  const placement = screen.getByRole('button', { name: /Release within 200 milliseconds/ })
  setBounds(placement, 40, 80, 1000, 700)
  return placement
}

function pointer(target: HTMLElement, type: 'down' | 'move' | 'up' | 'cancel', x: number, y: number) {
  fireEvent(target, new PointerEvent(`pointer${type}`, {
    bubbles: true,
    pointerId: 1,
    isPrimary: true,
    button: 0,
    buttons: type === 'up' || type === 'cancel' ? 0 : 1,
    clientX: x,
    clientY: y,
  }))
}

function advanceTime(milliseconds: number) {
  act(() => jest.advanceTimersByTime(milliseconds))
}

beforeEach(() => {
  localStorage.clear()
  jest.useFakeTimers()
})

afterEach(() => {
  cleanup()
  jest.clearAllTimers()
  jest.useRealTimers()
})

describe('note creation', () => {
  test('creates a default-sized note only on release before 200 ms', () => {
    const { board } = renderBoard()
    const placement = startCreation()
    const createButton = screen.getByRole('button', { name: 'Click to place or hold to resize' })

    expect(createButton).toBeDisabled()
    pointer(placement, 'down', 140, 180)
    expect(board.querySelector('.preview')).toHaveStyle({ width: '0px', height: '0px' })
    expect(screen.getAllByRole('listitem')).toHaveLength(3)

    pointer(placement, 'move', 170, 220)
    expect(board.querySelector('.preview')).toHaveStyle({ width: '30px', height: '40px' })
    advanceTime(199)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    pointer(placement, 'up', 170, 220)

    const text = screen.getByDisplayValue('')
    expect(text).toHaveAttribute('placeholder', 'Click to edit note text')
    expect(text.closest('li')).toHaveStyle({ left: '100px', top: '100px' })
    expect(text.parentElement).toHaveStyle({ width: '200px', height: '200px' })
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(board.querySelector('.preview')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create note' })).toBeEnabled()
  })

  test.each([200, 350])('keeps the preview below the minimum and applies the minimum on release at %i ms', (duration) => {
    const { board } = renderBoard()
    const placement = startCreation()
    pointer(placement, 'down', 140, 180)
    pointer(placement, 'move', 200, 250)
    expect(board.querySelector('.preview')).toHaveStyle({ width: '60px', height: '70px' })

    advanceTime(duration)
    expect(board.querySelector('.preview')).toHaveStyle({ width: '60px', height: '70px' })
    pointer(placement, 'move', 150, 200)
    expect(board.querySelector('.preview')).toHaveStyle({ width: '10px', height: '20px' })
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    pointer(placement, 'up', 150, 200)

    const text = screen.getByDisplayValue('')
    expect(text.parentElement).toHaveStyle({ width: '100px', height: '100px' })
    expect(text.closest('li')).toHaveStyle({ left: '100px', top: '100px' })
  })

  test.each([
    { endX: 590, endY: 550, left: '300px', top: '250px' },
    { endX: 90, endY: 110, left: '50px', top: '30px' },
  ])('uses the exact drawn size when released at ($endX, $endY)', ({ endX, endY, left, top }) => {
    renderBoard()
    const placement = startCreation()
    pointer(placement, 'down', 340, 330)
    advanceTime(250)
    pointer(placement, 'move', endX, endY)
    pointer(placement, 'up', endX, endY)

    const text = screen.getByDisplayValue('')
    expect(text.parentElement).toHaveStyle({ width: '250px', height: '220px' })
    expect(text.closest('li')).toHaveStyle({ left, top })
  })

  test('keeps a default-sized note inside the board when created near its edge', () => {
    renderBoard()
    const placement = startCreation()
    pointer(placement, 'down', 1030, 770)
    pointer(placement, 'up', 1030, 770)

    const text = screen.getByDisplayValue('')
    expect(text.closest('li')).toHaveStyle({ left: '800px', top: '500px' })
    expect(text.parentElement).toHaveStyle({ width: '200px', height: '200px' })
  })

  test('discards a cancelled preview without creating a note', () => {
    const { board } = renderBoard()
    const placement = startCreation()
    pointer(placement, 'down', 140, 180)
    advanceTime(250)
    pointer(placement, 'move', 400, 400)
    pointer(placement, 'cancel', 400, 400)

    expect(board.querySelector('.preview')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})

describe('moving and resizing notes', () => {
  test('moves a note by the pointer distance and stops updating after release', () => {
    renderBoard()
    const drag = screen.getByRole('button', { name: /^First note\. Drag/ })
    const item = drag.closest('li')

    pointer(drag, 'down', 70, 110)
    pointer(drag, 'move', 170, 190)
    expect(item).toHaveStyle({ left: '116px', top: '96px' })
    pointer(drag, 'up', 190, 200)
    expect(item).toHaveStyle({ left: '136px', top: '106px' })
    pointer(drag, 'move', 300, 300)
    expect(item).toHaveStyle({ left: '136px', top: '106px' })
  })

  test('keeps a dragged note inside every board edge', () => {
    renderBoard()
    const drag = screen.getByRole('button', { name: /^First note\. Drag/ })

    pointer(drag, 'down', 70, 110)
    pointer(drag, 'move', -500, -500)
    expect(drag.closest('li')).toHaveStyle({ left: '0px', top: '0px' })
    pointer(drag, 'move', 2000, 2000)
    expect(drag.closest('li')).toHaveStyle({ left: '800px', top: '500px' })
    pointer(drag, 'up', 2000, 2000)
    expect(drag).toBeInTheDocument()
  })

  test('resizes from the bottom-right corner while keeping the original position', () => {
    renderBoard()
    const text = screen.getByDisplayValue('First note')
    const item = text.closest('li')!
    const resize = within(item).getByRole('button', { name: /Resize note/ })

    pointer(resize, 'down', 256, 296)
    pointer(resize, 'move', 316, 336)
    expect(text.parentElement).toHaveStyle({ width: '260px', height: '240px' })
    expect(item).toHaveStyle({ left: '16px', top: '16px' })
    pointer(resize, 'up', 316, 336)
    pointer(resize, 'move', 500, 500)
    expect(text.parentElement).toHaveStyle({ width: '260px', height: '240px' })
  })

  test('enforces the minimum size and available board space when resizing', () => {
    renderBoard()
    const text = screen.getByDisplayValue('First note')
    const resize = within(text.closest('li')!).getByRole('button', { name: /Resize note/ })

    pointer(resize, 'down', 256, 296)
    pointer(resize, 'move', 70, 110)
    expect(text.parentElement).toHaveStyle({ width: '100px', height: '100px' })
    pointer(resize, 'move', 2000, 2000)
    expect(text.parentElement).toHaveStyle({ width: '984px', height: '684px' })
    pointer(resize, 'up', 2000, 2000)
    expect(text.closest('li')).toHaveStyle({ left: '16px', top: '16px' })
  })
})

describe('trash', () => {
  test('marks an overlapping note and deletes it only when released over the trash', () => {
    renderBoard()
    const drag = screen.getByRole('button', { name: /^First note\. Drag/ })

    pointer(drag, 'down', 70, 110)
    pointer(drag, 'move', 854, 394)
    expect(screen.getByRole('img', { name: 'Release to delete note' })).toHaveClass('trashActive')
    expect(drag.parentElement).toHaveClass('overTrash')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    pointer(drag, 'up', 854, 394)

    expect(screen.queryByDisplayValue('First note')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Create note' })).toHaveFocus()
  })

  test('keeps a note when moved away from the trash before release', () => {
    renderBoard()
    const drag = screen.getByRole('button', { name: /^First note\. Drag/ })

    pointer(drag, 'down', 70, 110)
    pointer(drag, 'move', 854, 394)
    expect(drag.parentElement).toHaveClass('overTrash')
    pointer(drag, 'move', 170, 190)
    expect(drag.parentElement).not.toHaveClass('overTrash')
    expect(screen.getByRole('img', { name: 'Drop a note here to delete it' })).not.toHaveClass('trashActive')
    pointer(drag, 'up', 170, 190)

    expect(screen.getByDisplayValue('First note')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})

describe('editing and persistence', () => {
  test('edits text without moving the note, including pointer movement over the text', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderBoard()
    const text = screen.getByDisplayValue('First note')

    expect(text).toHaveAttribute('readonly')
    await user.click(text)
    expect(text).not.toHaveAttribute('readonly')
    await user.clear(text)
    await user.type(text, 'Updated note')
    pointer(text, 'down', 80, 120)
    pointer(text, 'move', 300, 300)
    pointer(text, 'up', 300, 300)

    expect(text).toHaveValue('Updated note')
    expect(text.closest('li')).toHaveStyle({ left: '16px', top: '16px' })
    await user.tab()
    expect(text).toHaveAttribute('readonly')
  })

  test('waits for 200 ms without changes before saving the latest text', () => {
    renderBoard()
    advanceTime(200)
    const save = jest.spyOn(Storage.prototype, 'setItem')
    const text = screen.getByDisplayValue('First note')
    fireEvent.focus(text)
    fireEvent.change(text, { target: { value: 'First edit' } })
    advanceTime(199)
    expect(save).not.toHaveBeenCalled()
    fireEvent.change(text, { target: { value: 'Latest edit' } })
    advanceTime(199)
    expect(save).not.toHaveBeenCalled()
    advanceTime(1)

    expect(save).toHaveBeenCalledTimes(1)
    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)!)).toEqual(expect.arrayContaining([
      expect.objectContaining({ text: 'Latest edit' }),
    ]))
  })

  test('restores saved text, position and dimensions when the board mounts again', () => {
    const { unmount } = renderBoard()
    const text = screen.getByDisplayValue('First note')
    const drag = screen.getByRole('button', { name: /^First note\. Drag/ })
    pointer(drag, 'down', 70, 110)
    pointer(drag, 'move', 170, 190)
    pointer(drag, 'up', 170, 190)
    const resize = within(text.closest('li')!).getByRole('button', { name: /Resize note/ })
    pointer(resize, 'down', 356, 376)
    pointer(resize, 'move', 406, 406)
    pointer(resize, 'up', 406, 406)
    fireEvent.focus(text)
    fireEvent.change(text, { target: { value: 'Saved changes' } })
    advanceTime(200)
    unmount()
    renderBoard()

    const restored = screen.getByDisplayValue('Saved changes')
    expect(restored.closest('li')).toHaveStyle({ left: '116px', top: '96px' })
    expect(restored.parentElement).toHaveStyle({ width: '250px', height: '230px' })
  })

  test('saves pending changes when leaving the page', () => {
    renderBoard()
    const text = screen.getByDisplayValue('First note')
    fireEvent.focus(text)
    fireEvent.change(text, { target: { value: 'Last edit' } })
    fireEvent(window, new Event('pagehide'))

    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)!)).toEqual(expect.arrayContaining([
      expect.objectContaining({ text: 'Last edit' }),
    ]))
  })

  test('reports a storage failure while allowing further editing', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is full', 'QuotaExceededError')
    })
    renderBoard()
    advanceTime(200)

    expect(screen.getByRole('status')).toHaveTextContent('Notes could not be saved in this browser.')
    const text = screen.getByDisplayValue('First note')
    fireEvent.focus(text)
    fireEvent.change(text, { target: { value: 'Still editable' } })
    expect(text).toHaveValue('Still editable')
  })
})

test('creates, moves and resizes a note using the keyboard', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  renderBoard()
  expect(screen.getByRole('button', { name: 'Create note' })).toHaveFocus()
  await user.keyboard('{Enter}')
  const placement = screen.getByRole('button', { name: /Release within 200 milliseconds/ })
  setBounds(placement, 40, 80, 1000, 700)
  expect(placement).toHaveFocus()
  await user.keyboard(' ')

  const text = screen.getByDisplayValue('')
  const item = text.closest('li')!
  expect(item).toHaveStyle({ left: '400px', top: '250px' })
  const drag = within(item).getByRole('button', { name: /^Empty note\. Drag/ })
  act(() => drag.focus())
  await user.keyboard('{ArrowRight}{ArrowDown}')
  expect(item).toHaveStyle({ left: '410px', top: '260px' })
  await user.tab()
  await user.tab()
  expect(within(item).getByRole('button', { name: /Resize note/ })).toHaveFocus()
  await user.keyboard('{ArrowRight}{ArrowDown}')
  expect(text.parentElement).toHaveStyle({ width: '210px', height: '210px' })
})
