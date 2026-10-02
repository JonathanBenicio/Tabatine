# Design System Master File

> **LOGIC:** Refer to the root [design.md](../../design.md) for the primary "Source of Truth" in Portuguese.
> This file serves as the technical reference for hierarchical overrides.

---

**Project:** Tabatine
**Status:** Adaptive Themes (Light/Dark)
**Generated:** 2026-04-08 23:03:41 (Updated for Adaptive Themes)

---

## Global Rules

### Color Palette (Adaptive)

| Role | Dark (Zinc/Black) | Light (White/Slate) | CSS Token (V4) |
|------|-------------------|-------------------|----------------|
| Primary | `#F59E0B` (Amber) | `#F59E0B` (Amber) | `--color-primary` |
| CTA/Action | `#8B5CF6` (Violet) | `#8B5CF6` (Violet) | `--color-cta` |
| Background | `#000000` | `#FFFFFF` | `--color-background` |
| Card Surface | `rgba(24, 24, 27, 0.3)` | `rgba(255, 255, 255, 0.6)` | `--color-card` |

### Typography

- **Font Family:** Inter
- **Style:** Tight letter-spacing for headlines, clean vertical rhythm.
- **Weights:** 400 (Body), 600 (Semibold), 900 (Black).

---

## Component Specs

### Glassmorphism
- **Backdrop Blur:** `12px` to `20px` (`backdrop-blur-xl`).
- **Borders:** `1px solid rgba(255,255,255,0.1)` (Dark) / `1px solid rgba(0,0,0,0.05)` (Light).

### Cards
```css
/* Card Base */
.card-adaptive {
  transition: all 200ms ease;
  border-radius: 16px;
  backdrop-filter: blur(20px);
}

/* Dark Mode */
.dark .card-adaptive {
  background: rgba(24, 24, 27, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Light Mode */
.light .card-adaptive {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

---

## Style Guidelines

- **Keywords:** Glassmorphism, Premium, Adaptive, Clean, Fintech.
- **Animations:** All transitions Must use `ease-in-out` with a duration between `150ms` and `300ms`.

---

## Forbidden Patterns (Anti-Patterns)

- ❌ **Low Contrast** — Body text must be readable in both themes.
- ❌ **Emoji Icons** — Use only SVG (Lucide/Heroicons).
- ❌ **Missing Hover Feedback** — All interactive elements must show visual state changes.
- ❌ **Abrupt Theme Swaps** — Prefer smooth color transitions if possible via CSS `transition`.

---

## Pre-Delivery Checklist

- [ ] Support for both Light and Dark themes.
- [ ] Contrast ratio >= 4.5:1.
- [ ] Lucide icons used consistently.
- [ ] Responsive testing passed (375px to 1440px).
