# Tone Grid

Tone Grid is an open-source acoustic instrument conditioning app for sustained resonance work.

It is designed for players who want to run long-form tone cycles, explore sympathetic vibration, and mechanically excite notes across a full pitch grid. The project is inspired by dedicated instrument conditioning tools in this category, but takes a more flexible approach: the software is open source, the feature set is broader, and any companion hardware can be sourced a la carte instead of being locked into a single bundled system.

## What the project does

Tone Grid helps condition acoustic instruments by generating sustained tones that can be held for seconds, minutes, or hours.

The app currently supports two working modes:

- `Presets` — structured resonance cycles for common string instruments
- `Grid` — a full note grid for manually holding and releasing tones

Instead of treating the experience like a sequencer, Tone Grid focuses on long-held pitches, resonance strategies, and simple repeatable workflows.

## Core features

- Instrument-specific tuning presets
- Sustained resonance cycles with configurable hold time
- Configurable cycle runtime in minutes or hours
- Global octave transposition for the full preset cycle
- Neighbor-tone beating presets with simultaneous dual-tone playback
- Open-string and interval-based conditioning presets
- Manual full-note grid with click-to-hold tones
- Smooth fade-ins and fade-outs to reduce abrupt transitions
- Fully in-memory configuration with no backend or persistence requirements

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

## Preset categories

### Open Strings
- Cycle Up
- Cycle Down
- Ping-Pong
- Adjacent Pairs

### Neighbor Tones
- Tight Neighbor Beating ($\pm 1$ semitone)
- Wide Neighbor Beating ($\pm 2$ semitones)

### Intervals / Drones
- Fifth Drone
- Octave Drone
- Root + Fifth Pattern
- Root + Octave Pattern

## How it works

### Presets mode
Use `Presets` mode when you want a structured conditioning routine.

You can:

- choose an instrument
- choose a preset category
- choose a conditioning preset
- shift the whole cycle up or down by octaves
- set how long each tone should ring
- set how long the full cycle should continue

Neighbor-tone presets play two outer tones simultaneously to create controlled beating around a string center. Example: around `G`, a tight neighbor preset uses `F#` and `G#` together.

### Grid mode
Use `Grid` mode when you want direct manual control.

The note grid lets you:

- click any note to start sustaining it
- click again to release it
- hold multiple notes at once
- clear all active notes instantly

This is useful for experimentation, custom resonance work, and testing notes outside the built-in preset system.

## Why this project exists

Tone Grid is built for musicians who want:

- a software-first conditioning workflow
- more control over duration and pitch behavior
- transparent, modifiable source code
- the freedom to pair the app with their own speakers, transducers, amps, stands, or custom hardware setups

## Tech stack

- React
- Vite
- Web Audio API
- ESLint

## Getting started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Run lint checks

```bash
npm run lint
```

## Project structure

- [config/instruments.ts](config/instruments.ts) — supported instruments and standard tunings
- [config/presets.ts](config/presets.ts) — preset categories and preset definitions
- [src/App.jsx](src/App.jsx) — main UI, tabs, controls, and interaction flow
- [src/utils/audio.js](src/utils/audio.js) — sustained tone playback and live grid audio
- [src/utils/patterns.js](src/utils/patterns.js) — preset pattern resolution
- [src/utils/notes.js](src/utils/notes.js) — note, MIDI, frequency, and transposition helpers

## Current design principles

- keep the UI simple
- prefer readable configuration over heavy abstraction
- keep playback focused on resonance and conditioning
- avoid backend dependencies
- make it easy to extend instruments, presets, and hardware workflows later

## Roadmap ideas

- export and share custom presets
- alternate wave shapes and voicing controls
- hardware integration guides
- configurable amplitude profiles
- improved mobile and tablet ergonomics

## Open source

This project is intended to stay flexible, inspectable, and hackable. If you want to adapt it for a different instrument family, alternate tunings, or a custom hardware setup, the current structure is meant to make that straightforward.
