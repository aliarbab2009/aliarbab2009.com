# Icon conventions

How icons get into this site, and how they should behave.

## Sources

- **Custom marks** live in `src/components/icons/`. Each is a single-purpose SVG component (e.g. `<StockSaathiMark />`).
- **Lucide** is the default for generic UI icons (arrows, chevrons, social marks, etc.). Tree-shaken — only the imports we use ship.
- **No Heroicons / Phosphor / FontAwesome.** Adding a second library is a bundle hit for an aesthetic preference.

## Sizing

All icons accept `className` and inherit `currentColor`. Default size is `w-4 h-4` (16px); set explicitly when the design calls for something else. Never set a fixed `fill` — always inherit from text color so dark/light/per-project themes Just Work.

## Accessibility

- **Decorative icons** (alongside a text label): `aria-hidden="true"`. Screen readers skip them.
- **Standalone icons** (icon-only button): the parent `<button>` gets `aria-label="Open ..."`. The icon stays `aria-hidden`.
- **Informational SVGs** with no parent label: include `<title>` as the first child.

## Performance

- SVG inline, not via `<img src=*.svg>`. Inline lets us re-paint with CSS variables and skips an HTTP round-trip.
- Compress with `svgo` before commit if dropping in from Figma.
- Avoid `<defs>` and IDs — they collide when multiple instances of the same icon render on one page.

## Project marks

Each project world (StockSaathi, BolHisaab, MagLock) gets one custom mark in `src/components/icons/`. The mark is monochrome by default; the project theme class repaints it via `currentColor`. Do not hard-code the project's accent color into the mark.
