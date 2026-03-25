# Resort Map — Project Summary

## Goal

Build an interactive resort map webapp where guests can visually browse cabanas, pool areas, chalets, and paths rendered from an ASCII map file, and eventually book cabanas.

## Current State

**Map rendering is implemented.** The ASCII map is parsed and displayed as a tile grid using Next.js `<Image>` components.

### What's been done

- **`ResortMap` component** in `app/page.tsx` — accepts an `asciiMap` string prop, splits it into rows/characters, and renders each character as a 32×32px tile in a CSS flex grid.
- **Tile mapping:**
  - `W` → `cabana.png` (cabana)
  - `p` → `pool.png` (pool, with `textureWater.png` background)
  - `#` → `arrowCrossing.png` (path)
  - `c` → `houseChimney.png` (chalet)
  - `.` → empty space (no image, same tile size)
- **Background:** The entire map grid has a `parchmentBasic.png` background texture.
- **Assets copied** from `assets/` to `public/` for serving: `cabana.png`, `pool.png`, `arrowCrossing.png`, `houseChimney.png`, `parchmentBasic.png`, `textureWater.png`.
- **ASCII map** is currently hardcoded as a constant in `page.tsx` (sourced from `ResortMapCodeTest/map.ascii`).

### What's NOT done yet

- No backend / REST API.
- No cabana booking flow (click cabana → booking form → confirmation).
- No guest validation against `bookings.json`.
- No visual distinction between available/booked cabanas.
- No CLI `--map` / `--bookings` argument support.
- No tests.
- Map source is hardcoded — not yet loaded from file or API.
- Only `arrowCrossing.png` is used for paths (`#`) — other arrow assets (`arrowCornerSquare`, `arrowEnd`, `arrowSplit`, `arrowStraight`) are not yet used for directional path rendering.

## Tech Stack

- **Next.js 16.2.1** (App Router)
- **React 19.2.4**
- **TypeScript**
- **Tailwind CSS 4**
- **pnpm** package manager

## Project Structure

```
app/
  layout.tsx        — Root layout (Geist fonts, Tailwind)
  page.tsx          — Home page with ResortMap component
  globals.css       — Global styles
assets/             — Source tile images (10 PNGs)
public/             — Served static files (copied tile PNGs)
ResortMapCodeTest/
  README.md         — Full task brief
  map.ascii         — ASCII map file (20x19 grid)
  bookings.json     — Guest list (101 guests, rooms 101-520)
```

## ASCII Map Format

20 columns × 19 rows. Each character = one tile. The map depicts chalets (`c`) surrounding a network of paths (`#`), with a pool area (`p`) enclosed by cabanas (`W`) in the lower section.

## Available Assets (not yet all used)

| File                  | Used | Purpose                  |
|-----------------------|------|--------------------------|
| `cabana.png`          | Yes  | Cabana tile (`W`)        |
| `pool.png`            | Yes  | Pool tile (`p`)          |
| `arrowCrossing.png`   | Yes  | Path tile (`#`)          |
| `houseChimney.png`    | Yes  | Chalet tile (`c`)        |
| `parchmentBasic.png`  | Yes  | Map background texture   |
| `textureWater.png`    | Yes  | Pool tile background     |
| `arrowCornerSquare.png` | No | Corner path variant     |
| `arrowEnd.png`        | No   | Dead-end path variant    |
| `arrowSplit.png`      | No   | T-junction path variant  |
| `arrowStraight.png`   | No   | Straight path variant    |
