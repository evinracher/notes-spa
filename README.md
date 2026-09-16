# Sticky Notes

A desktop React + TypeScript app for creating, moving, resizing, editing, and deleting sticky notes. Notes are saved in local storage and restored on reload.

Deployed in: https://evinracher.github.io/notes-spa/

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

`npm ci` installs the dependencies from `package-lock.json`. Open the local URL printed by Vite, normally `http://localhost:5173/notes-spa/`. If that port is occupied, use the alternative URL shown in the terminal. Press Ctrl+C to stop the server.

## Build and preview

```sh
npm run build
npm run preview
```

The build checks TypeScript and generates the production files in `dist/`. Open the URL printed by the preview server, normally `http://localhost:4173/notes-spa/`. Preview serves the existing build; run the build command again after making changes.

To check code with the linter:

```sh
npm run lint
```

## Deploy to GitHub Pages

With Git installed and authenticated to push to the `origin` repository, run:

```sh
npm run deploy
```

This runs all Jest tests once, builds the app, and publishes `dist/` to the `gh-pages` branch. If the tests or build fail, publishing does not run.

## Tests

```sh
npm test
```

Use `npm test -- --watch` to rerun tests while editing. Tests live next to the code: `src/utils/notesStorage.test.ts` covers loading and validating saved notes, and `src/components/Board.test.tsx` covers creation, dragging, resizing, deletion, text editing, keyboard controls, and saving changes.

Jest and React Testing Library run in jsdom with simulated dimensions, pointer capture, and timers. These tests check behavior, not visual layout or browser compatibility. `npm run build` also checks TypeScript in the test files.

## Usage

- **Create:** click Create note, then press and drag on the board. The preview resizes freely immediately. Release before 200 ms for a 200 × 200 note; otherwise, the drawn size is used with a minimum of 100 × 100 applied on release.
- **Move:** drag the note background outside its text area.
- **Resize:** drag the bottom-right grip.
- **Edit:** click the text or the empty-note placeholder. Click outside the text to finish editing.
- **Delete:** drag a note over the trash icon. The note turns translucent red; release to delete it, or move away to keep it.
- **Keyboard:** use Tab to focus controls. Enter or Space on the placement area creates a centered note. Arrow keys move a focused note or resize it when its grip is focused; Enter or Space drops a focused note.

Changes are saved automatically in the same browser and site address. Clearing site data removes saved notes. If storage is unavailable, editing remains usable and a message indicates that changes cannot be saved.

## Architecture

`Board` keeps the list of notes in React state and handles creating, updating, and deleting them. Each note stores an ID, text, an `x` and `y` position measured in pixels from the board's top-left corner, and a `size` containing its width and height. `NoteList` displays the notes at those positions using absolute positioning. Each `Note` handles user input and calls functions provided by `Board` to update its data. Shared TypeScript types describe this data, and CSS modules keep component styles separate.

When dragging starts, `Note` remembers the pointer's starting position and the note's original position in a React ref. As the pointer moves, it adds the distance travelled to that original position. Resizing works the same way: dragging the bottom-right grip adds the pointer movement to the original width and height, while the top-left corner stays fixed. `Board` applies these updates, keeps notes within its boundaries, and enforces a minimum size of 100 × 100 pixels when resizing existing notes. Pointer capture keeps receiving movement and release events even when the pointer leaves the control. The text area is separate from the drag control, so editing text does not move the note. During a drag, `Board` also checks for overlap with the trash and deletes the note if it is released there.

Creating a note uses a separate preview in state until the pointer is released. The preview can shrink freely; a release before 200 ms creates a default 200 × 200 note, while a longer press uses the drawn size with the minimum applied only on release. Saved notes include their text, position, and size. `Board` writes them to local storage after 200 ms without changes, and also when leaving the page, to avoid saving on every movement or keystroke. On startup, `src/utils/notesStorage.ts` checks the stored data before restoring it and falls back to the initial notes if it is missing or invalid.

## Browser support

Intended for current Chrome, Firefox, and Edge. Previous checks passed on macOS with Chrome 153, Firefox 155, and Edge 153. Windows and Linux were not directly tested.
