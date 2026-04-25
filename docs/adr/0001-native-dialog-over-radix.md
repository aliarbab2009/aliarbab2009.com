# ADR 0001: Use the native `<dialog>` element over Radix Dialog

**Status:** accepted · **Date:** 2026-04-25

## Context

The portfolio needs a ⌘K command palette: a centered modal with a
search input, filtered command list, and keyboard navigation. The
plan file originally specified Radix UI primitives for accessibility.

By the time this component landed, three things had become clear:

1. The browser's native `<dialog>` element (Baseline since 2022)
   provides exactly the primitives we need: focus trap, `::backdrop`
   pseudo for the overlay, `Escape` dismissal, top-layer rendering
   above all stacking contexts.
2. The site already uses zero Radix primitives elsewhere — adding
   `@radix-ui/react-dialog` and its peer deps would be a ~15 KB+
   bundle hit for a single feature.
3. The custom-event bus we wanted (so a footer button or future "?"
   help overlay can also trigger the palette) is trivial to implement
   over `window.dispatchEvent('open-command-palette')` and equally
   trivial regardless of the underlying dialog primitive.

## Decision

Build the command palette on the native `<dialog>` element. No Radix.

The component opens via `dialog.showModal()`, listens for both the
global `⌘K` / `Ctrl+K` keydown and the `open-command-palette` custom
event. Keyboard navigation (`↑↓ Enter Esc`) is implemented in a
single `onKeyDown` handler. Backdrop clicks close via mousedown
delegation (`e.target === dialog`).

## Consequences

**Pros:**

- Zero new dependencies. Bundle delta ~3 KB total (component logic
  only — no library shim).
- Browser-native focus management is correct by default; the dialog
  pseudo-classes also handle SR/a11y semantics automatically.
- `aria-modal`, `Esc`, focus trap, focus-return-on-close — all free.

**Cons:**

- `<dialog>` styling varies subtly across browsers (Safari paints
  the backdrop slightly differently). Mitigated by explicit
  `::backdrop` rules in the component's Tailwind classes.
- We hand-roll the filter / highlight logic that Radix Combobox
  would have given us. Acceptable: the logic is ~30 LOC.

If we later need keyboard-shortcut overlay surfaces beyond this one
palette (e.g. a `?` help dialog), we can fork the same primitive.

## Tested by

`src/components/shell/command-palette-trigger.test.tsx` covers the
trigger button + the custom-event bridge to the palette. The dialog's
keyboard / focus-trap semantics are deferred to browser-native
behavior and a future Playwright e2e covering full open-close-navigate.
