# [notes-spa] Add “Move backward” and “Send to back” note actions

**Type:** Feature / User story  
**Area:** Notes board · Note options menu  
**Priority:** Medium (proposed)

## Description

The note options menu currently supports **Bring forward** and **Bring to front**. Users cannot directly move a note behind another note or place it behind all notes.

Add the complementary actions **Move backward** (“Mover hacia atrás”) and **Send to back** (“Enviar al fondo”). Keep the visible labels in English to match the existing interface.

## User story

As a user organizing overlapping notes, I want to move a note backward by one layer or send it behind all other notes so that I can control which notes appear on top without changing their positions.

## Acceptance criteria

For the examples below, `[A, B, C, D]` represents note order **from back to front**.

| ID | Scenario | Expected result |
|---|---|---|
| AC1 | Open a note’s three-dot menu. | **Move backward** and **Send to back** appear alongside the existing ordering actions. |
| AC2 | Select **Move backward** on C in `[A, B, C, D]`. | Order becomes `[A, C, B, D]`. C moves exactly one layer backward. |
| AC3 | Select **Send to back** on C in `[A, B, C, D]`. | Order becomes `[C, A, B, D]`. C appears behind every other note. |
| AC4 | Use either action on the backmost note, including when only one note exists. | Order remains unchanged, without errors. The actions remain available, consistent with the existing forward actions at their boundary. |
| AC5 | Perform either action. | All notes retain their IDs, text, colors, positions, and sizes. The relative order of all other notes remains unchanged. |
| AC6 | Reorder notes that do not currently overlap. | The same ordering rules apply across the full board; overlap is not required. |
| AC7 | Activate either action using a mouse or keyboard. | The action runs once, the menu closes, and focus returns to that note’s options button. No drag or resize starts. |
| AC8 | Reorder notes and reload after automatic saving completes. | The updated order is restored from local storage. If saving fails, the existing storage-error behavior applies and in-session reordering remains usable. |
| AC9 | Use existing note interactions after the change. | Bring forward, Bring to front, editing, colors, movement, resizing, deletion, and menu dismissal continue working. |

## Technical notes

- Keep ordering state in [Board.tsx](src/components/Board.tsx). The notes array already runs from back to front.
- Move backward changes the selected note’s index from `i` to `i - 1`; Send to back moves it to index `0`. Use immutable state updates and safely ignore unknown IDs.
- Pass the new callbacks through `NoteList` → `Note` → `NoteMenu`, updating the corresponding TypeScript props.
- Reuse the existing [menu action handling](src/components/Notes/NoteMenu.tsx) for closing and restoring focus.
- Preserve the `sticky-notes-v1` storage format and existing save mechanism. No additional ordering field or storage migration is needed.

## Out of scope

Undo/redo, multi-note selection, dedicated keyboard shortcuts, interface translation, and changes to note creation or drag behavior.

## Definition of done

- Acceptance criteria are covered by focused tests in `Board.test.tsx`, including boundaries, persistence, keyboard activation, and data preservation.
- Overlapping notes are visually checked to confirm both stacking behaviors.
- `npm test -- --ci`, `npm run build`, and `npm run lint` pass.
- README ordering instructions describe both new actions.
