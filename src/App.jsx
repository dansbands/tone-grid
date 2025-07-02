import React, { useRef, useState } from "react";

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const OCTAVES = [1, 2, 3, 4, 5, 6, 7];

export default function ToneGrid() {
  const audioCtxRef = useRef(null);
  const activeNotesRef = useRef({});
  const [activeKeys, setActiveKeys] = useState(new Set());

  const getFrequency = (noteIndex, octave) => {
    const midi = 12 * (octave + 1) + noteIndex;
    return 440 * Math.pow(2, (midi - 69) / 12);
  };

  const toggleNote = (noteIndex, octave) => {
    const key = `${noteIndex}-${octave}`;
    const isActive = activeKeys.has(key);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    if (isActive) {
      // stop
      const { osc, gain } = activeNotesRef.current[key];
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtxRef.current.currentTime + 0.3
      );
      osc.stop(audioCtxRef.current.currentTime + 0.3);
      delete activeNotesRef.current[key];
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    } else {
      // start
      const freq = getFrequency(noteIndex, octave);
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      gain.gain.setValueAtTime(0.2, audioCtxRef.current.currentTime);
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();

      activeNotesRef.current[key] = { osc, gain };
      setActiveKeys((prev) => new Set(prev).add(key));
    }
  };

  const clearAllNotes = () => {
    // Stop all active notes
    activeKeys.forEach((key) => {
      const { osc, gain } = activeNotesRef.current[key];
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtxRef.current.currentTime + 0.3
      );
      osc.stop(audioCtxRef.current.currentTime + 0.3);
      delete activeNotesRef.current[key];
    });

    // Clear the activeKeys set
    setActiveKeys(new Set());
  }

  return (
    <div>
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${OCTAVES.length}, 60px)`,
            gridTemplateRows: `repeat(${NOTE_NAMES.length}, 40px)`,
            gap: "4px",
          }}
        >
          {NOTE_NAMES.slice()
            .reverse()
            .map((note, rowIndex) => {
              const actualNoteIndex = NOTE_NAMES.length - 1 - rowIndex;
              return OCTAVES.map((octave) => {
                const key = `${actualNoteIndex}-${octave}`;
                const label = `${note}${octave}`;
                const isActive = activeKeys.has(key);
                return (
                  <div
                    key={key}
                    onClick={() => toggleNote(actualNoteIndex, octave)}
                    style={{
                      border: "1px solid #aaa",
                      background: isActive
                        ? "#ffd56b"
                        : `hsl(${(actualNoteIndex * 30) % 360}, 70%, 85%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      userSelect: "none",
                    }}
                  >
                    {label}
                  </div>
                );
              });
            })}
        </div>
      </div>
      <button onClick={clearAllNotes}>Clear All Notes</button>
    </div>
  );
}
