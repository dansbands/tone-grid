import { transposeNote } from "./notes";

function createStep(note, durationSeconds, label) {
  return {
    notes: [note],
    durationSeconds,
    label,
  };
}

function getOrderedIndexes(length, mode) {
  const indexes = Array.from({ length }, (_, index) => index);

  if (mode === "down") {
    return indexes.reverse();
  }

  if (mode === "ping-pong") {
    if (length <= 1) {
      return [0];
    }

    return [...indexes, ...indexes.slice(1, -1).reverse()];
  }

  return indexes;
}

export function buildBasicCycle({ instrument, mode, holdDurationSeconds, octaveShift = 0 }) {
  const semitones = octaveShift * 12;

  return getOrderedIndexes(instrument.strings.length, mode).map((stringIndex) => {
    const string = instrument.strings[stringIndex];
    const shiftedNote = transposeNote(string.note, semitones);

    return createStep(
      shiftedNote,
      holdDurationSeconds,
      `${string.label} open string`
    );
  });
}