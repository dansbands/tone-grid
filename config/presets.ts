export const presetCategories = [
  "Open Strings",
  "Neighbor Tones",
  "Intervals / Drones",
];

export const presets = [
  {
    id: "cycle-up",
    category: "Open Strings",
    name: "Cycle Up (low → high)",
    loop: true,
    pattern: { type: "open-cycle", direction: "up" },
  },
  {
    id: "cycle-down",
    category: "Open Strings",
    name: "Cycle Down (high → low)",
    loop: true,
    pattern: { type: "open-cycle", direction: "down" },
  },
  {
    id: "ping-pong",
    category: "Open Strings",
    name: "Ping-Pong (low ↔ high)",
    loop: true,
    pattern: { type: "open-ping-pong" },
  },
  {
    id: "adjacent-pairs",
    category: "Open Strings",
    name: "Adjacent Pairs",
    loop: true,
    pattern: { type: "adjacent-pairs" },
  },
  {
    id: "tight-neighbor-beating",
    category: "Neighbor Tones",
    name: "Tight Neighbor Beating (± semitone)",
    loop: true,
    pattern: { type: "neighbor-beating", interval: 1 },
  },
  {
    id: "wide-neighbor-beating",
    category: "Neighbor Tones",
    name: "Wide Neighbor Beating (± whole step)",
    loop: true,
    pattern: { type: "neighbor-beating", interval: 2 },
  },
  {
    id: "fifth-drone",
    category: "Intervals / Drones",
    name: "Fifth Drone",
    loop: true,
    pattern: { type: "drone", interval: 7 },
  },
  {
    id: "octave-drone",
    category: "Intervals / Drones",
    name: "Octave Drone",
    loop: true,
    pattern: { type: "drone", interval: 12 },
  },
  {
    id: "root-fifth-pattern",
    category: "Intervals / Drones",
    name: "Root + Fifth Pattern",
    loop: true,
    pattern: { type: "root-interval-pattern", interval: 7 },
  },
  {
    id: "root-octave-pattern",
    category: "Intervals / Drones",
    name: "Root + Octave Pattern",
    loop: true,
    pattern: { type: "root-interval-pattern", interval: 12 },
  },
];

export const presetsById = Object.fromEntries(
  presets.map((preset) => [preset.id, preset])
);