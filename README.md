# Section Refresh

An Obsidian plugin that adds a **one-click refresh button** to opt-in headings. Clicking it resets every checkbox in that heading's section (including subsections) back to unchecked `[ ]` — built to kill the chore of manually un-ticking recurring routine checklists in weekly/daily notes.

> Status: in development (v0.1.0). Not yet on Community Plugins.

## How it works

Mark a heading by adding an invisible comment marker to its line:

```
# Daily %%reset%%
```

- The `%%reset%%` marker is hidden in reading mode and hidden in Live Preview until your cursor enters the line — same behavior as the `#` heading mark.
- A refresh icon then appears on the far right of that heading. Click it to reset all checkboxes in the section.
- Don't want to type the marker? Right-click a heading (or use the command) to add/remove it.

The token (`reset`) is configurable in settings.

## Commands

Both are assignable to a hotkey via Settings → Hotkeys (no default is shipped):

- **Reset section under cursor**
- **Toggle reset marker on heading under cursor**

## Development

```bash
npm install      # install deps
npm run dev      # esbuild watch
npm run build    # type-check + production bundle
npm test         # run unit tests (vitest)
```

Design spec: [.ai/docs/2026-06-26-section-refresh-design.md](.ai/docs/2026-06-26-section-refresh-design.md).

## License

MIT
