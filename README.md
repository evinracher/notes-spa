# Sticky Notes

A desktop app for creating, moving, resizing, coloring, and organizing sticky notes. Your notes are saved in your browser local storage and restored on reload.

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

Unit tests cover the toolbar's creation button, automatic text contrast, manual colors, color reset, and saved-note validation. Integration tests cover creating, editing, moving, resizing, ordering, deleting, and saving notes. Use `npm test -- --watch` to rerun them while editing.

## Usage

The board starts empty unless you have previously saved notes in this browser.

- **Create:** click Create note, then press and drag on the board. The preview resizes freely immediately. Release before 200 ms for a 200 × 200 note; otherwise, the drawn size is used with a minimum of 160 × 160 applied on release.
- **Colors:** choose New note color and New text color before creating a note. Dark backgrounds automatically suggest light text unless you choose the text color yourself. Reset colors restores the defaults and automatic suggestions.
- **Recolor:** open a note's three-dot menu to change its background or text color independently.
- **Order:** in the three-dot menu, Bring forward moves a note up one layer; Bring to front places it above all other notes.
- **Move:** drag the note background outside its text area.
- **Resize:** drag the bottom-right grip.
- **Edit:** click the text or the empty-note placeholder. Click outside the text to finish editing.
- **Delete:** drag a note over the trash icon. The note turns translucent red; release to delete it, or move away to keep it.
- **Keyboard:** use Tab to focus controls. Enter or Space on the placement area creates a centered note. Arrow keys move a focused note or resize it when its grip is focused; Enter or Space drops a focused note. Escape closes the note options.

Text, colors, positions, sizes, and note order are saved automatically in the same browser and site address. Clearing site data removes saved notes. If storage is unavailable, editing remains usable and a message indicates that changes cannot be saved.

## Architecture

The app uses React and TypeScript. `Board` holds the notes and the colors selected for new notes. `Toolbar` groups the creation controls and handles automatic text contrast, manual color choices, and resetting colors. `NoteList` displays the notes, and each `Note` sends changes back to `Board`. The list runs from back to front: Bring forward moves a note one place along the list, while Bring to front moves it to the end. `NoteMenu` contains each note's color and ordering controls.

Positions are measured from the board's top-left corner. Dragging adds the pointer's movement to the note's starting position. Resizing adds that movement to its starting width and height, keeping the top-left corner fixed. The board limits movement and size to its boundaries, with a minimum note size of 160 × 160. New notes use a preview until release, and notes dropped over the trash are removed.

Notes and their order are saved in local storage and checked before being restored. Without valid saved notes, the board starts empty. Component styles use CSS modules, and editing text or using the options menu does not start a drag.

## Browser support

Intended for current Chrome, Firefox, and Edge. Previous checks passed on macOS with Chrome 153, Firefox 155, and Edge 153. Windows and Linux were not directly tested.
