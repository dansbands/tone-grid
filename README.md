# ToneGrid

ToneGrid is the free/demo product in this family.

It exists to show the basic value of sustained tones for acoustic instrument conditioning without exposing premium workflows, intelligence, analysis, or pro tooling.

## Product scope

ToneGrid includes only the entry-level experience:

- a full note grid
- instrument pages with open-string access
- sustained tones
- basic playback controls
- guest usage
- optional signup captured only for the current session
- a gated demo period that gives a real feel for the product while limiting abuse

ToneGrid does not include:

- advanced conditioning workflows
- structured routines
- saved sessions
- long-duration preset recall
- guided intent-based flows
- resonance targeting
- comparison tools
- luthier or shop workflows
- analysis features
- scientific adjustment tooling
- premium intelligence of any kind

## Current app surfaces

### Instruments
- choose an instrument
- hold open strings manually
- run a simple open-string cycle
- shift the whole cycle by octaves
- control tone hold time and cycle duration

### Grid
- manually hold and release notes across the full note grid
- clear active notes at any time

## Supported instruments

- Violin
- 5-string violin
- Viola
- Cello
- Mandolin
- Guitar
- Banjo (5-string)
- Bass
- Dobro (G tuning)

## Demo access model

ToneGrid is meant to be useful as a free product while still protecting the boundary with paid products.

The current demo model is intentionally lightweight:

- guest access works immediately
- optional signup is available but stored only in memory for the current session
- playback is gated by a limited demo window

## Architecture

See [docs/product-boundary.md](docs/product-boundary.md) for the product boundary and repo ownership rules.

See [docs/migration-inventory.md](docs/migration-inventory.md) for premium/pro concepts removed or deferred for later migration.

## Tech stack

- React
- Vite
- Web Audio API
- ESLint
- Vitest

## Development

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Test

```bash
npm run test
```

## Project structure

- [config/instruments.ts](config/instruments.ts) — free ToneGrid instrument data
- [src/App.jsx](src/App.jsx) — main free product UI
- [src/utils/audio.js](src/utils/audio.js) — sustained tone playback
- [src/utils/basicCycles.js](src/utils/basicCycles.js) — basic free-only cycle construction
- [src/utils/demoAccess.js](src/utils/demoAccess.js) — guest demo timing rules
- [src/utils/notes.js](src/utils/notes.js) — note and transposition helpers

## Product principle

ToneGrid should remain a clean, useful, no-intelligence entry product. It should demonstrate the value of sustained tones without leaking premium workflows that belong elsewhere.
