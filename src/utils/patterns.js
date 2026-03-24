import { transposeNote } from "./notes";

function createStep(notes, durationSeconds, label) {
  return {
    notes,
    durationSeconds,
    label,
  };
}

function createStringNote(instrument, stringIndex, offset = 0) {
  const string = instrument.strings[stringIndex];
  return transposeNote(string.note, offset);
}

function createRootNote(instrument, offset = 0) {
  return transposeNote(instrument.strings[0].note, offset);
}

function getAscendingIndexes(length) {
  return Array.from({ length }, (_, index) => index);
}

function getPingPongIndexes(length) {
  if (length <= 1) {
    return [0];
  }

  const ascending = getAscendingIndexes(length);
  const descending = ascending.slice(1, -1).reverse();

  return [...ascending, ...descending];
}

function buildOpenCycle(instrument, direction, durationSeconds) {
  const indexes = getAscendingIndexes(instrument.strings.length);
  const orderedIndexes = direction === "down" ? indexes.reverse() : indexes;

  return orderedIndexes.map((stringIndex) => {
    const string = instrument.strings[stringIndex];

    return createStep(
      [createStringNote(instrument, stringIndex)],
      durationSeconds,
      `${string.label} open resonance`
    );
  });
}

function buildPingPong(instrument, durationSeconds) {
  return getPingPongIndexes(instrument.strings.length).map((stringIndex) => {
    const string = instrument.strings[stringIndex];

    return createStep(
      [createStringNote(instrument, stringIndex)],
      durationSeconds,
      `${string.label} resonance sweep`
    );
  });
}

function buildAdjacentPairs(instrument, durationSeconds) {
  return instrument.strings.slice(0, -1).flatMap((string, stringIndex) => {
    const nextString = instrument.strings[stringIndex + 1];

    return [
      createStep(
        [createStringNote(instrument, stringIndex)],
        durationSeconds,
        `${string.label} before ${nextString.label}`
      ),
      createStep(
        [createStringNote(instrument, stringIndex + 1)],
        durationSeconds,
        `${nextString.label} after ${string.label}`
      ),
    ];
  });
}

function buildNeighborBeating(instrument, interval, durationSeconds) {
  return instrument.strings.map((string, stringIndex) =>
    createStep(
      [
        createStringNote(instrument, stringIndex, -interval),
        createStringNote(instrument, stringIndex, interval),
      ],
      durationSeconds,
      `${string.label} outer neighbors`
    )
  );
}

function buildDrone(instrument, interval, durationSeconds) {
  const intervalLabel = interval === 7 ? "fifth" : "octave";

  return [
    createStep([createRootNote(instrument)], durationSeconds, "Root drone"),
    createStep(
      [createRootNote(instrument, interval)],
      durationSeconds,
      `${intervalLabel} drone`
    ),
  ];
}

function buildRootIntervalPattern(instrument, interval, durationSeconds) {
  const intervalLabel = interval === 7 ? "Fifth" : "Octave";

  return [
    createStep([createRootNote(instrument)], durationSeconds, "Root conditioning"),
    createStep(
      [createRootNote(instrument, interval)],
      durationSeconds,
      `${intervalLabel} conditioning`
    ),
    createStep([createRootNote(instrument)], durationSeconds, "Root return"),
    createStep(
      [createRootNote(instrument, interval)],
      durationSeconds,
      `${intervalLabel} return`
    ),
  ];
}

export function resolvePresetPattern(instrument, preset, holdDurationSeconds) {
  const durationSeconds = holdDurationSeconds;

  switch (preset.pattern.type) {
    case "open-cycle":
      return buildOpenCycle(instrument, preset.pattern.direction, durationSeconds);
    case "open-ping-pong":
      return buildPingPong(instrument, durationSeconds);
    case "adjacent-pairs":
      return buildAdjacentPairs(instrument, durationSeconds);
    case "neighbor-beating":
      return buildNeighborBeating(instrument, preset.pattern.interval, durationSeconds);
    case "drone":
      return buildDrone(instrument, preset.pattern.interval, durationSeconds * 1.25);
    case "root-interval-pattern":
      return buildRootIntervalPattern(
        instrument,
        preset.pattern.interval,
        durationSeconds
      );
    default:
      return [];
  }
}