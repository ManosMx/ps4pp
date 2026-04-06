---
description: "Design system theme specification. Loaded by the theme-applier agent when styling components, updating CSS variables, or choosing colors/fonts/spacing."
applyTo: "app/src/styles/**,app/src/components/**"
---

# Design System

Single source of truth for colors, typography, shape, and spacing.

## Theme

Light color mode only. No dark mode overrides.

## Colors

Palette variant: **fidelity** (high-contrast, accessible).

| Token             | Hex       | Usage                                             |
| ----------------- | --------- | ------------------------------------------------- |
| Primary           | `#005249` | Key interactive elements, CTAs, active nav states |
| Secondary         | `#006B5F` | Supporting UI elements, secondary actions         |
| Tertiary / Accent | `#FF5722` | Highlights, badges, decorative accents            |

### Derived tokens

Generate foreground colors that meet WCAG AA contrast against each background:

- `--primary-foreground`: white (`#FFFFFF`) on `#005249`
- `--secondary-foreground`: white (`#FFFFFF`) on `#006B5F`
- `--accent-foreground`: white (`#FFFFFF`) on `#FF5722`

## Typography

| Role      | Font Family | Usage                                     |
| --------- | ----------- | ----------------------------------------- |
| Headlines | `Manrope`   | h1–h6, page titles, card headings         |
| Body      | `Inter`     | Paragraphs, general content, descriptions |
| Labels    | `Inter`     | Buttons, form labels, interactive text    |

Import via Google Fonts or `next/font`. Always provide a sans-serif fallback.

## Shape

**Moderate** roundedness — use `border-radius: 0.5rem` (`rounded-lg` in Tailwind) as the default for cards, buttons, and inputs.

## Spacing

**Normal** spacing — follow Tailwind's default spacing scale. Prefer `gap-4` / `p-4` as the baseline unit for component padding and gaps.
