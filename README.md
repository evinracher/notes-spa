# Sticky Notes

React + TypeScript app built with Vite.

Create, move, resize, edit, and delete notes. Notes are saved to local storage and restored on reload.
Designed for current Chrome, Firefox, and Edge on desktop, starting at 1024 × 768.

Click Create note, then release within 200 ms for a 200 × 200 note. Hold longer and drag to preview any size. On release, the note is created with a minimum of 100 × 100. Click note text to edit it. Drag the note background to move it, and release over the trash to delete it.

Browser checks passed on macOS with Chrome 153, Firefox 155, and Edge 153. Windows and Linux were not directly tested.

Requires Node.js 22.12+.

```sh
npm install
npm run dev
```

`npm run build` checks types and creates the production build in `dist`.
`npm run preview` serves the production build locally.
`npm run lint` runs the linter.
