# Sticky Notes

A desktop React + TypeScript app for creating, moving, resizing, editing, and deleting sticky notes. Notes are saved in local storage and restored on reload.

## Requirements

- Node.js 22.12 or newer, with npm.
- A desktop screen of at least 1024 × 768.

No backend, API keys, or environment variables are required.

## Install and run

Download or clone the project and open a terminal in its root directory, where `package.json` is located.

```sh
npm ci
npm run dev
```

`npm ci` installs the dependencies from `package-lock.json`. Open the local URL printed by Vite, normally `http://localhost:5173`. If that port is occupied, use the alternative URL shown in the terminal. Press Ctrl+C to stop the server.

## Build and preview

```sh
npm run build
npm run preview
```

The build checks TypeScript and generates the production files in `dist/`. Open the URL printed by the preview server, normally `http://localhost:4173`. Preview serves the existing build; run the build command again after making changes.

To check code with the linter:

```sh
npm run lint
```

## Usage

- **Create:** click Create note, then press and drag on the board. The preview resizes freely immediately. Release before 200 ms for a 200 × 200 note; otherwise, the drawn size is used with a minimum of 100 × 100 applied on release.
- **Move:** drag the note background outside its text area.
- **Resize:** drag the bottom-right grip.
- **Edit:** click the text or the empty-note placeholder. Click outside the text to finish editing.
- **Delete:** drag a note over the trash icon. The note turns translucent red; release to delete it, or move away to keep it.
- **Keyboard:** use Tab to focus controls. Enter or Space on the placement area creates a centered note. Arrow keys move a focused note or resize it when its grip is focused; Enter or Space drops a focused note.

Changes are saved automatically in the same browser and site address. Clearing site data removes saved notes. If storage is unavailable, editing remains usable and a message indicates that changes cannot be saved.

## Architecture

`Board` owns the notes and coordinates creation, movement, resizing, deletion, and persistence. Each note stores an ID, text, position, and dimensions. `NoteList` renders the collection, and `Note` handles text editing and pointer or keyboard input through callbacks. Pointer capture keeps dragging and resizing active when the pointer leaves a control.

Shared types live in `src/types`, and component styles use CSS modules. Gesture starting positions are held in refs, while notes and creation previews use React state. `notesStorage.ts` validates restored data. Storage writes are delayed by 200 ms to avoid writing on every pointer movement or keystroke, with a final save when leaving the page.

## Browser support

Intended for current Chrome, Firefox, and Edge. Previous checks passed on macOS with Chrome 153, Firefox 155, and Edge 153. Windows and Linux were not directly tested.
