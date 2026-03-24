const NOTE_INDEX = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

const NOTE_NAMES = Object.keys(NOTE_INDEX);

export function noteToMidi(note) {
  const match = /^([A-G]#?)(-?\d+)$/.exec(note);

  if (!match) {
    throw new Error(`Invalid note: ${note}`);
  }

  const [, name, octaveText] = match;
  const octave = Number(octaveText);

  if (!Object.prototype.hasOwnProperty.call(NOTE_INDEX, name)) {
    throw new Error(`Invalid note name "${name}" in note: ${note}`);
  }

  if (!Number.isFinite(octave)) {
    throw new Error(`Invalid octave "${octaveText}" in note: ${note}`);
  }
  return NOTE_INDEX[name] + (octave + 1) * 12;
}

export function midiToNote(midi) {
  const normalizedMidi = Math.round(midi);
  const noteName = NOTE_NAMES[((normalizedMidi % 12) + 12) % 12];
  const octave = Math.floor(normalizedMidi / 12) - 1;

  return `${noteName}${octave}`;
}

export function transposeNote(note, semitones) {
  return midiToNote(noteToMidi(note) + semitones);
}

export function noteToFrequency(note) {
  const midi = noteToMidi(note);
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function formatNote(note) {
  return note;
}

export function stripOctave(note) {
  return note.replace(/-?\d+$/, "");
}