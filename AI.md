# AI-Assisted Workflow

This document describes the AI workflow used to build the Resort Map project. Each session corresponds to a separate context window with Claude Code (Claude Opus 4.6).

---

## Session 1 — Initial Map Rendering

### Summary

Bootstrapped the Next.js project and implemented the first visual rendering of the ASCII map. The map was hardcoded as a constant in `page.tsx`. Each character was mapped to a 32x32px tile image (`cabana.png`, `pool.png`, `houseChimney.png`, etc.) and rendered in a flex grid. Path tiles (`#`) used a directional algorithm to select the correct arrow variant (straight, corner, split, crossing, end) and rotation based on neighboring tiles. A `SUMMARY.md` was generated to track progress.

### What was built

- `ResortMap` client component in `app/page.tsx` with tile rendering
- `TILE_MAP` mapping characters to image sources
- `getPathTile()` function with 4-way connectivity logic for path rotation
- Assets copied from `assets/` to `public/`
- `data/bookings.json` with 120 guest entries
- shadcn/ui button component and utilities (`lib/utils.ts`)
- `SUMMARY.md` documenting completed and remaining work

### Prompt (structured for LLM reproduction)

```markdown
## Context

You are working on a resort map web application. The project has been bootstrapped with
`create-next-app` using Next.js 16, React 19, TypeScript, TailwindCSS 4, and pnpm.

The following files are provided:
- `ResortMapCodeTest/README.md` — Full task brief describing the requirements
- `ResortMapCodeTest/map.ascii` — ASCII map file (20 columns x 19 rows)
- `ResortMapCodeTest/bookings.json` — Guest list (120 guests, rooms 101-520)
- `assets/` — Tile images: cabana.png, pool.png, houseChimney.png, arrowStraight.png,
  arrowCornerSquare.png, arrowCrossing.png, arrowSplit.png, arrowEnd.png, parchmentBasic.png,
  textureWater.png

## Task

Implement the visual map rendering as the first milestone:

1. Copy all tile images from `assets/` to `public/` so they can be served statically.
2. Create a `ResortMap` client component that:
   - Takes the ASCII map content and splits it into rows and characters.
   - Renders each character as a 32x32px tile using Next.js `<Image>`.
   - Maps characters to images: `W` → cabana, `p` → pool (with water texture background),
     `c` → chalet, `.` → empty space, `#` → path.
3. For path tiles (`#`), implement directional rendering:
   - Analyze the 4 neighboring tiles (up, down, left, right) to determine connectivity.
   - Select the correct arrow image variant (straight, corner, split, crossing, end)
     and apply the appropriate CSS rotation (0°, 90°, 180°, 270°).
   - Buildings (`c`, `W`) adjacent to a path should connect to it, but each building
     should only have one path entry point (prefer bottom, then top, then sides).
4. Use a parchment background texture behind the entire map grid.
5. Copy the bookings file to `data/bookings.json`.
6. Create a `SUMMARY.md` tracking what has been completed and what remains.

## Constraints

- Hardcode the map content as a constant in `page.tsx` for now (API comes later).
- Use Next.js `<Image>` for all tile rendering.
- Keep all rendering logic in a single file for this milestone.
- Do not implement booking, API routes, or interactivity yet.
```

---

## Session 2 — Full Feature Implementation

### Summary

Major refactoring and feature completion session. The monolithic `page.tsx` was decomposed into a proper component architecture. A complete RESTful backend was added with three API routes. The booking flow (click cabana → dialog → validate → confirm) was implemented end-to-end. CLI argument support was added via a shell script. Content validation was built for both map and bookings files. A comprehensive test suite was written covering API routes, components, and utility functions.

### What was built

**Component architecture:**
- `components/resort-map/index.tsx` — Main component with data fetching and state management
- `components/resort-map/map-row.tsx` — Single row renderer
- `components/resort-map/map-tile.tsx` — Individual tile with click handling and booked state
- `components/booking-dialog.tsx` — Check-in form with validation and error handling
- `components/ui/dialog.tsx`, `input.tsx`, `label.tsx`, `sonner.tsx` — shadcn UI primitives

**Backend:**
- `app/api/map/route.ts` — GET endpoint serving validated map content
- `app/api/bookings/route.ts` — GET endpoint serving bookings + booked cabana list
- `app/api/book/route.ts` — POST endpoint for check-in with credential validation
- `app/api/_state.ts` — In-memory Set tracking booked cabanas

**Infrastructure:**
- `hooks/use-resort-map.ts` — Extracted TILE_MAP, getPathTile(), assignRoomNumbers()
- `lib/cli-paths.ts` — Configurable file paths via environment variables
- `lib/content-validation.ts` — Map and bookings file validators
- `types/resort-map.ts` — Booking interface, ALLOWED_MAP_CHARS, BOOKING_KEYS
- `scripts/run.sh` — Dev startup with `--map` and `--bookings` CLI arg parsing
- `scripts/validate-user-files.ts` — Pre-flight file validation before server start
- `data/map.ascii`, `data/new-map.ascii` — Map files
- `data/invalid-map.ascii`, `data/invalid-bookings.json` — Invalid test fixtures

**Tests (Vitest + Testing Library):**
- `__tests__/api/map.test.ts` — Map route handler tests
- `__tests__/api/bookings.test.ts` — Bookings route handler tests
- `__tests__/api/book.test.ts` — Book route handler tests
- `__tests__/lib/validation.test.ts` — Content validation unit tests
- `__tests__/lib/map-building.test.ts` — assignRoomNumbers and getPathTile tests
- `__tests__/components/booking-dialog.test.tsx` — Dialog interaction tests
- `__tests__/components/resort-map.test.tsx` — Map rendering and booking flow tests
- `__tests__/setup.ts` — Test environment setup

**Cleanup:**
- Removed `assets/` folder (images already in `public/`)
- Removed `ResortMapCodeTest/` folder
- Removed `SUMMARY.md`
- Simplified `app/page.tsx` to just render `<ResortMap />`

### Prompt (structured for LLM reproduction)

```markdown
## Context

You are working on a resort map web application built with Next.js 16, React 19, TypeScript,
and TailwindCSS 4. The initial map rendering is already implemented as a monolithic component
in `app/page.tsx` with hardcoded map data. Tile images are in `public/`. A bookings file
exists at `data/bookings.json` with 120 guest entries (rooms 101-520, each with `room` and
`guestName` fields).

Read `ResortMapCodeTest/README.md` for the full task specification.

## Task

Implement the complete application with proper architecture, backend API, booking flow,
CLI support, and tests.

### 1. Component Architecture

Refactor the monolithic `page.tsx` into a proper component structure:

- **`components/resort-map/index.tsx`** — Main client component that fetches map and bookings
  data from the API on mount, parses the ASCII map into rows, assigns room numbers to cabanas
  using `assignRoomNumbers()`, and manages selected-room state for the booking dialog.
- **`components/resort-map/map-row.tsx`** — Renders a single row of `MapTile` components.
- **`components/resort-map/map-tile.tsx`** — Renders individual tiles. Cabanas (`W`) should
  show room numbers, display a red overlay + grayscale filter when checked in, and be clickable
  only when available. Path tiles use `getPathTile()` for directional rendering.
- **`components/booking-dialog.tsx`** — Dialog form with room number and guest name fields.
  Submits to `POST /api/book`. Shows inline error messages. Clears errors on input change.
  Shows a toast notification on success. Guest name matching is case-insensitive.
- Add shadcn/ui primitives as needed: `dialog.tsx`, `input.tsx`, `label.tsx`, `sonner.tsx`.

Extract logic into a custom hook:
- **`hooks/use-resort-map.ts`** — Export `TILE_MAP`, `TILE_SIZE` (32), `getPathTile()`,
  and `assignRoomNumbers()`. Room numbering: sequential top-to-bottom left-to-right,
  20 rooms per floor (101-120, 201-220, etc.).

### 2. Backend API Routes

Create three route handlers:

- **`GET /api/map`** — Read map file from configurable path (default `data/map.ascii`).
  Validate content using `validateMapContent()`. Return `{ map: string }`.
  Return 400 for invalid content, 500 for read errors.

- **`GET /api/bookings`** — Read bookings JSON from configurable path (default
  `data/bookings.json`). Validate using `validateBookingsContent()`. Return
  `{ bookings: Booking[], bookedCabanas: number[] }` where `bookedCabanas` comes from
  an in-memory server-side Set.

- **`POST /api/book`** — Accept `{ room, guestName, cabanaNumber }`. Check cabana
  availability against the in-memory Set (409 if taken). Validate credentials against
  bookings file — room must match exactly, guestName case-insensitive (404 if no match).
  On success, add cabana to Set and return welcome message. 400 for missing fields,
  500 for server errors.

- **`app/api/_state.ts`** — Export a global `Set<number>` for tracking booked cabanas
  (session-scoped, resets on server restart).

### 3. Shared Libraries

- **`types/resort-map.ts`** — `Booking` interface (`room: string`, `guestName: string`),
  `ALLOWED_MAP_CHARS` Set (`.`, `c`, `#`, `W`, `p`, `\n`),
  `BOOKING_KEYS` ReadonlySet (`room`, `guestName`).

- **`lib/content-validation.ts`** — Two validation functions:
  - `validateMapContent(content, filePath?)` — Check file extension is `.ascii`,
    check all characters are in ALLOWED_MAP_CHARS. Return `{ valid, error? }`.
  - `validateBookingsContent(raw)` — Parse JSON, verify non-empty array, each entry
    must be an object with exactly `room` and `guestName` (both strings), no extra keys.

- **`lib/cli-paths.ts`** — `getMapPath()` and `getBookingsPath()` functions that check
  `MAP_PATH` / `BOOKINGS_PATH` environment variables, falling back to defaults.
  Resolve all paths with `resolve(process.cwd(), path)`.

### 4. CLI Support

- **`scripts/run.sh`** — Bash script that parses `--map` and `--bookings` arguments,
  exports them as `MAP_PATH` and `BOOKINGS_PATH` environment variables, runs the
  validation script, then execs `npx next dev`.

- **`scripts/validate-user-files.ts`** — Node script (run with `--experimental-strip-types`)
  that reads and validates both files using the content-validation functions.
  Exit with code 1 and error message if invalid.

- **`package.json`** `dev` script: `bash scripts/run.sh`

### 5. Test Data

- **`data/map.ascii`** — The default ASCII map from the task spec.
- **`data/new-map.ascii`** — An alternative map layout for testing different configurations.
- **`data/invalid-map.ascii`** — A map with invalid characters (e.g., `e`, `s`) for
  validation testing.
- **`data/invalid-bookings.json`** — Bookings with an extra property (e.g., `"e"`) for
  validation testing.

### 6. Tests

Write comprehensive tests using Vitest 4 + Testing Library + jsdom:

**API tests** (mock `fs/promises` and `cli-paths`):
- `__tests__/api/map.test.ts` — Valid map returns 200, invalid content returns 400,
  missing file returns 500.
- `__tests__/api/bookings.test.ts` — Valid bookings returns 200 with bookings array
  and bookedCabanas list, invalid content returns 400, missing file returns 500.
- `__tests__/api/book.test.ts` — Successful booking returns 200, missing fields returns 400,
  no matching booking returns 404, already booked cabana returns 409.

**Library tests:**
- `__tests__/lib/validation.test.ts` — Test both validation functions with valid and
  invalid inputs (bad chars, wrong extension, malformed JSON, extra keys, missing fields).
- `__tests__/lib/map-building.test.ts` — Test `assignRoomNumbers()` numbering logic
  and `getPathTile()` directional selection.

**Component tests** (mock fetch, sonner, Next Image):
- `__tests__/components/resort-map.test.tsx` — Map renders tiles, loading state,
  error state, booking flow integration.
- `__tests__/components/booking-dialog.test.tsx` — Form renders, submission, error
  display, input clearing, success toast.

### 7. Cleanup

- Remove `assets/` folder (images are already in `public/`).
- Remove `ResortMapCodeTest/` folder.
- Remove `SUMMARY.md`.
- Simplify `app/page.tsx` to just import and render `<ResortMap />`.

## Constraints

- Use sonner for toast notifications.
- Use shadcn/ui patterns for UI primitives.
- Guest name validation is case-insensitive (trim + toLowerCase).
- Room numbers are assigned sequentially top-to-bottom, left-to-right, 20 per floor.
- Booked cabanas show red overlay + grayscale filter.
- No persistent storage — in-memory Set is sufficient.
- No authentication — room number + guest name is sufficient.
```

---

## Session 3 — README and Documentation

### Summary

Created a comprehensive `README.md` with all required sections: tech stack, backend route documentation (all three endpoints with request/response formats and status codes), folder structure with annotations, running instructions (with and without CLI args, file format requirements, example file pointers), and test commands. Added Assumptions and Core Design Decisions sections explaining component structure choices, route handlers over server actions, custom hook extraction, project folder organization, and dual validation strategy. Reordered sections per preference: commands first, then assumptions + design decisions, tech stack, backend, folder structure, tests last.

### Prompt (structured for LLM reproduction)

```markdown
## Context

You are working on a completed resort map web application. The full codebase is implemented
with Next.js 16, React 19, TypeScript, and a RESTful API backend. All features, tests, and
CLI support are in place.

## Task

Create a `README.md` with the following sections in this exact order:

### 1. Running the Project
- `pnpm install` for dependencies
- `pnpm dev` for default files (uses `data/map.ascii` and `data/bookings.json`)
- `pnpm dev -- --map <path> --bookings <path>` for custom files
- Note that both flags are optional and independent
- Note that the startup script validates files before launching
- Document file format requirements:
  - Map: `.ascii` file with only `.`, `c`, `#`, `W`, `p` characters
  - Bookings: JSON array of `{ "room": "...", "guestName": "..." }` objects
- Point users to `data/new-map.ascii` for an alternative layout example
- Mention `data/invalid-map.ascii` and `data/invalid-bookings.json` as examples of
  invalid inputs (used in tests)
- `pnpm build` + `pnpm start` for production

### 2. Assumptions (content section, not just title)
- Bookings file only has `room` and `guestName` — no coordinates or explicit cabana
  assignments. Room numbers are assigned sequentially top-to-bottom, left-to-right
  as they appear in the map. This is the most intuitive mapping given the data.
- Room numbers are visible on tiles, so the only real check-in validator is the guest
  name (case-insensitive match).

### 3. Core Design Decisions (content section, not just title)
Document these decisions with rationale:
- **Component structure:** `components/ui/` for generic primitives (no domain logic),
  `components/resort-map/` as a feature folder grouping related components,
  `booking-dialog.tsx` at components root because it has its own business logic.
- **Route Handlers over Server Actions:** Server Actions would be simpler but the
  requirement was to expose a standalone API.
- **Custom hook:** `use-resort-map.ts` extracts logic from components for cleaner
  separation and independent testability.
- **Project folders:** Dedicated `types/`, `data/`, `lib/`, `hooks/` folders for
  scalability rather than colocating under `app/`.
- **Dual validation:** Files validated at CLI startup (fast feedback) and at runtime
  in each API route (guards against files changing on disk).

### 4. Tech Stack
List: Next.js 16 (App Router) + React 19, TypeScript 5, TailwindCSS 4, shadcn/ui +
Base UI + Lucide icons, Sonner, Vitest 4 + Testing Library + jsdom, pnpm.

### 5. Backend
Document all three routes with request/response formats and all status codes:
- `GET /api/map`
- `GET /api/bookings`
- `POST /api/book`
- In-memory state explanation

### 6. Folder Structure
Annotated tree of the full project with one-line comments for each file/folder.

### 7. Running Tests
- `pnpm test` and `pnpm test:watch`
- Brief description of test coverage areas
```
