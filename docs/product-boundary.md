# Product boundary

## Repo purpose

This repository is for `ToneGrid` only.

ToneGrid is the free/demo product for acoustic instrument conditioning. It should stay small, direct, and easy to understand.

## What belongs in ToneGrid

- note grid
- instrument pages
- sustained tones
- basic playback controls
- guest usage
- optional signup
- demo gating / usage limiting
- simple instrument and note configuration
- basic audio playback helpers

## What does not belong in ToneGrid

- advanced conditioning workflows
- structured routines or guided flows
- saved sessions or session recall
- long-duration custom routine storage
- resonance targeting or intent systems
- comparison workflows
- luthier/shop tooling
- analysis or measurement features
- scientific adjustment tooling
- premium intelligence or pro recommendations

## Ownership split

### ToneGrid repo
Owns the free entry product and only the free entry product.

### ToneSmith repo
Owns premium user workflows such as advanced routines, recall, guidance, and more opinionated conditioning experiences.

### ToneSmith Pro repo
Owns pro analysis, luthier/shop workflows, measurement, comparison, and scientific or build-adjustment tooling.

### Shared core repo
Owns reusable low-level building blocks that are product-neutral, such as:

- note math
- frequency conversion
- instrument schema primitives
- low-level audio scheduling utilities
- common demo/auth shell pieces when they become truly shared

## Current audit summary

### Keep in ToneGrid
- [src/App.jsx](../src/App.jsx) basic instrument/grid UI
- [config/instruments.ts](../config/instruments.ts) instrument tuning data
- [src/utils/audio.js](../src/utils/audio.js) sustained tone playback
- [src/utils/notes.js](../src/utils/notes.js) note conversion utilities
- [src/utils/basicCycles.js](../src/utils/basicCycles.js) simple open-string cycles
- [src/utils/demoAccess.js](../src/utils/demoAccess.js) guest demo gating

### Remove entirely from ToneGrid
- premium-flavored marketing language about intelligence or advanced conditioning
- premium workflow labels such as resonance strategies, intent systems, or structured recall

### Move later to ToneSmith repo
- advanced conditioning routines
- custom presets and long-duration recall
- guided or intent-based workflows
- richer routine sequencing beyond basic open-string demo cycles

### Move later to ToneSmith Pro repo
- analysis features
- luthier/shop workflows
- comparison tools
- scientific build-adjustment tooling

### Move later to shared core repo
- reusable note math if consumed by multiple products
- reusable audio scheduling primitives if they remain product-neutral
- shared instrument schemas if maintained across product repos