import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { instruments } from "../config/instruments.ts";
import { createLiveNotePlayer, createTonePlayer } from "./utils/audio";
import { buildBasicCycle } from "./utils/basicCycles";
import { formatCountdown, getDemoAccessState } from "./utils/demoAccess";
import { formatNote, transposeNote } from "./utils/notes";

const DURATION_UNIT_OPTIONS = [
  { value: "seconds", label: "Seconds", singular: "second", plural: "seconds", multiplier: 1 },
  { value: "minutes", label: "Minutes", singular: "minute", plural: "minutes", multiplier: 60 },
  { value: "hours", label: "Hours", singular: "hour", plural: "hours", multiplier: 3600 },
];
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const OCTAVES = [1, 2, 3, 4, 5, 6, 7];
const OCTAVE_SHIFT_OPTIONS = [-2, -1, 0, 1, 2];
const DEMO_DURATION_SECONDS = 15 * 60;
const BASIC_CYCLE_OPTIONS = [
  { id: "up", label: "Open strings up" },
  { id: "down", label: "Open strings down" },
  { id: "ping-pong", label: "Open strings ping-pong" },
];

function convertDurationToSeconds(value, unit) {
  const selectedUnit = DURATION_UNIT_OPTIONS.find((option) => option.value === unit);
  return Math.max(Number(value) || 1, 1) * (selectedUnit?.multiplier ?? 1);
}

function formatDuration(value, unit) {
  const option = DURATION_UNIT_OPTIONS.find((item) => item.value === unit);
  const unitLabel = option ? (value === 1 ? option.singular : option.plural) : unit;
  return `${value} ${unitLabel}`;
}

function formatStepDuration(seconds) {
  if (seconds % 3600 === 0) {
    return formatDuration(seconds / 3600, "hours");
  }

  if (seconds % 60 === 0) {
    return formatDuration(seconds / 60, "minutes");
  }

  return formatDuration(seconds, "seconds");
}

export default function App() {
  const [activeTab, setActiveTab] = useState("instruments");
  const [instrumentId, setInstrumentId] = useState(instruments[0].id);
  const [cycleMode, setCycleMode] = useState(BASIC_CYCLE_OPTIONS[0].id);
  const [octaveShift, setOctaveShift] = useState(0);
  const [holdDurationValue, setHoldDurationValue] = useState(15);
  const [holdDurationUnit, setHoldDurationUnit] = useState("seconds");
  const [cycleDurationValue, setCycleDurationValue] = useState(10);
  const [cycleDurationUnit, setCycleDurationUnit] = useState("minutes");
  const [accessMode, setAccessMode] = useState("guest");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupSubmitted, setSignupSubmitted] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [activeLiveNotes, setActiveLiveNotes] = useState(new Set());
  const playerRef = useRef(null);
  const liveNotePlayerRef = useRef(null);
  const demoStartedAtRef = useRef(Date.now());
  const selectionKeyRef = useRef("");

  const instrument = useMemo(
    () => instruments.find((item) => item.id === instrumentId) ?? instruments[0],
    [instrumentId]
  );

  const holdDurationSeconds = useMemo(
    () => convertDurationToSeconds(holdDurationValue, holdDurationUnit),
    [holdDurationValue, holdDurationUnit]
  );

  const cycleDurationSeconds = useMemo(
    () => convertDurationToSeconds(cycleDurationValue, cycleDurationUnit),
    [cycleDurationValue, cycleDurationUnit]
  );

  const demoAccess = useMemo(
    () =>
      getDemoAccessState({
        startedAt: demoStartedAtRef.current,
        now,
        durationSeconds: DEMO_DURATION_SECONDS,
      }),
    [now]
  );

  const cycleSteps = useMemo(
    () => buildBasicCycle({ instrument, mode: cycleMode, holdDurationSeconds, octaveShift }),
    [instrument, cycleMode, holdDurationSeconds, octaveShift]
  );

  const selectionKey = [
    activeTab,
    instrumentId,
    cycleMode,
    octaveShift,
    holdDurationValue,
    holdDurationUnit,
    cycleDurationValue,
    cycleDurationUnit,
    accessMode,
  ].join(":");

  useEffect(() => {
    playerRef.current = createTonePlayer({
      onStepChange: setCurrentStepIndex,
      onPlaybackStateChange: setIsPlaying,
    });
    liveNotePlayerRef.current = createLiveNotePlayer();

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
      playerRef.current?.dispose();
      liveNotePlayerRef.current?.dispose();
      playerRef.current = null;
      liveNotePlayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectionKeyRef.current) {
      selectionKeyRef.current = selectionKey;
      return;
    }

    if (selectionKeyRef.current !== selectionKey) {
      playerRef.current?.stop();
      liveNotePlayerRef.current?.stopAll();
      setActiveLiveNotes(new Set());
    }

    selectionKeyRef.current = selectionKey;
  }, [selectionKey]);

  useEffect(() => {
    if (demoAccess.expired) {
      playerRef.current?.stop();
      liveNotePlayerRef.current?.stopAll();
      setActiveLiveNotes(new Set());
    }
  }, [demoAccess.expired]);

  const handleCycleToggle = async () => {
    if (!playerRef.current || demoAccess.expired) {
      return;
    }

    if (isPlaying) {
      playerRef.current.stop();
      return;
    }

    await playerRef.current.playSequence({
      steps: cycleSteps,
      loop: true,
      runForSeconds: cycleDurationSeconds,
    });
  };

  const handleLiveNoteToggle = async (note) => {
    if (!liveNotePlayerRef.current || demoAccess.expired) {
      return;
    }

    const isActive = await liveNotePlayerRef.current.toggleNote(note);

    setActiveLiveNotes((previous) => {
      const next = new Set(previous);

      if (isActive) {
        next.add(note);
      } else {
        next.delete(note);
      }

      return next;
    });
  };

  const handleClearLiveNotes = () => {
    liveNotePlayerRef.current?.stopAll();
    setActiveLiveNotes(new Set());
  };

  const handleSignupSubmit = (event) => {
    event.preventDefault();

    if (!signupEmail.trim()) {
      return;
    }

    setSignupSubmitted(true);
    setAccessMode("signup");
  };

  const currentStep = currentStepIndex >= 0 ? cycleSteps[currentStepIndex] : null;

  return (
    <main className="app-shell">
      <section className="panel hero-panel">
        <p className="eyebrow">Free ToneGrid demo</p>
        <h1>Simple sustained tones for acoustic instrument conditioning.</h1>
        <p className="hero-copy">
          ToneGrid is the free entry product: a clean note grid, instrument-specific
          string views, and basic sustained playback without premium analysis or guided workflows.
        </p>
        <div className="tab-row" role="tablist" aria-label="ToneGrid views">
          {[
            { id: "instruments", label: "Instruments" },
            { id: "grid", label: "Grid" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab-button ${activeTab === tab.id ? "tab-button-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel access-panel">
        <div className="access-copy">
          <h2>Guest demo access</h2>
          <p>
            Use ToneGrid as a guest or optionally sign up for product updates. This demo session is intentionally time-limited so it stays useful without becoming an unlimited automation tool.
          </p>
        </div>
        <div className="access-controls">
          <div className="access-status-row">
            <span className="status-pill">
              {demoAccess.expired
                ? "Demo period ended"
                : `Time remaining: ${formatCountdown(demoAccess.remainingSeconds)}`}
            </span>
            <span className="status-pill status-pill-secondary">
              {accessMode === "signup" || signupSubmitted ? "Optional signup selected" : "Guest mode active"}
            </span>
          </div>

          <div className="access-button-row">
            <button
              type="button"
              className={accessMode === "guest" ? "primary-button" : "secondary-button"}
              onClick={() => setAccessMode("guest")}
            >
              Continue as guest
            </button>
            <button
              type="button"
              className={accessMode === "signup" ? "primary-button" : "secondary-button"}
              onClick={() => setAccessMode("signup")}
            >
              Optional signup
            </button>
          </div>

          {accessMode === "signup" ? (
            <form className="signup-form" onSubmit={handleSignupSubmit}>
              <input
                type="email"
                aria-label="Email for product updates"
                placeholder="Email for product updates"
                value={signupEmail}
                onChange={(event) => setSignupEmail(event.target.value)}
              />
              <button type="submit">Save for this session</button>
            </form>
          ) : null}

          {signupSubmitted ? (
            <p className="helper-copy">Signup interest saved in this demo session only.</p>
          ) : null}
        </div>
      </section>

      {activeTab === "instruments" ? (
        <>
          <section className="panel controls-panel">
            <div className="control-grid">
              <label className="field">
                <span>Instrument</span>
                <select value={instrumentId} onChange={(event) => setInstrumentId(event.target.value)} disabled={demoAccess.expired}>
                  {instruments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Basic demo cycle</span>
                <select value={cycleMode} onChange={(event) => setCycleMode(event.target.value)} disabled={demoAccess.expired}>
                  {BASIC_CYCLE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Shift by octaves</span>
                <select value={octaveShift} onChange={(event) => setOctaveShift(Number(event.target.value))} disabled={demoAccess.expired}>
                  {OCTAVE_SHIFT_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value > 0 ? `+${value}` : value}
                    </option>
                  ))}
                </select>
              </label>

              <div className="field">
                <span>Sustain each tone for</span>
                <div className="duration-row">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={holdDurationValue}
                    onChange={(event) => setHoldDurationValue(Number(event.target.value) || 1)}
                    disabled={demoAccess.expired}
                  />
                  <select value={holdDurationUnit} onChange={(event) => setHoldDurationUnit(event.target.value)} disabled={demoAccess.expired}>
                    {DURATION_UNIT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <span>Continue demo cycle for</span>
                <div className="duration-row">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={cycleDurationValue}
                    onChange={(event) => setCycleDurationValue(Number(event.target.value) || 1)}
                    disabled={demoAccess.expired}
                  />
                  <select value={cycleDurationUnit} onChange={(event) => setCycleDurationUnit(event.target.value)} disabled={demoAccess.expired}>
                    {DURATION_UNIT_OPTIONS.filter((option) => option.value !== "seconds").map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="action-row">
              <button className="primary-button" onClick={handleCycleToggle} disabled={demoAccess.expired}>
                {isPlaying ? "Stop cycle" : "Start cycle"}
              </button>
              <div className="status-pill">
                {demoAccess.expired
                  ? "Guest demo locked"
                  : isPlaying && currentStep
                    ? `Playing: ${currentStep.label}`
                    : `Cycle length: ${formatDuration(cycleDurationValue, cycleDurationUnit)}`}
              </div>
            </div>
          </section>

          <section className="content-grid">
            <article className="panel strings-panel">
              <div className="section-header">
                <div>
                  <h2>{instrument.name}</h2>
                  <p>Instrument page with open strings and simple tone controls.</p>
                </div>
              </div>

              <div className="string-list">
                {instrument.strings.map((string, index) => {
                  const shiftedNote = transposeNote(string.note, octaveShift * 12);
                  const isActive = activeLiveNotes.has(shiftedNote);

                  return (
                    <div key={`${string.label}-${index}`} className="string-card">
                      <div>
                        <span className="string-label">{string.label}</span>
                        <div className="string-note">{formatNote(shiftedNote)}</div>
                      </div>
                      <button
                        type="button"
                        className={isActive ? "secondary-button" : "primary-button"}
                        onClick={() => handleLiveNoteToggle(shiftedNote)}
                        disabled={demoAccess.expired}
                      >
                        {isActive ? "Release tone" : "Hold tone"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="panel pattern-panel">
              <div className="section-header">
                <div>
                  <h2>Demo cycle preview</h2>
                  <p>Free ToneGrid only includes basic open-string demo cycles.</p>
                </div>
              </div>

              <div className="pattern-list">
                {cycleSteps.map((step, index) => (
                  <div key={`${step.label}-${index}`} className={`pattern-step ${currentStepIndex === index ? "pattern-step-active" : ""}`}>
                    <div>
                      <strong>Step {index + 1}</strong>
                      <p>{step.label}</p>
                    </div>
                    <div className="pattern-notes">
                      {step.notes.map((note) => formatNote(note)).join(" + ")} · {formatStepDuration(step.durationSeconds)}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      ) : (
        <section className="panel grid-panel">
          <div className="section-header">
            <div>
              <h2>Full note grid</h2>
              <p>Basic free grid for manually holding and releasing sustained tones.</p>
            </div>
            <div className="grid-actions">
              <div className="status-pill">
                {activeLiveNotes.size ? `${activeLiveNotes.size} active tones` : "No active tones"}
              </div>
              <button type="button" onClick={handleClearLiveNotes} disabled={demoAccess.expired}>
                Clear grid
              </button>
            </div>
          </div>

          <div className="note-grid">
            {NOTE_NAMES.slice()
              .reverse()
              .map((_, rowIndex) => {
                const actualNoteIndex = NOTE_NAMES.length - 1 - rowIndex;

                return OCTAVES.map((octave) => {
                  const note = `${NOTE_NAMES[actualNoteIndex]}${octave}`;
                  const isActive = activeLiveNotes.has(note);

                  return (
                    <button
                      key={note}
                      type="button"
                      className={`note-cell ${isActive ? "note-cell-active" : ""}`}
                      onClick={() => handleLiveNoteToggle(note)}
                      disabled={demoAccess.expired}
                    >
                      {note}
                    </button>
                  );
                });
              })}
          </div>
        </section>
      )}
    </main>
  );
}
