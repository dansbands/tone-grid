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
const SPECTRUM_SWATCHES = [
  "#ff7a59",
  "#ffb347",
  "#f6d860",
  "#6bcf7f",
  "#49b6ff",
  "#6f7bff",
  "#c86bff",
];
const ENABLE_CYCLE_CONTROLS = false;
const ENABLE_OCTAVE_SHIFT = false;
const ENABLE_HOLD_DURATION_CONTROL = false;
const ENABLE_CYCLE_DURATION_CONTROL = false;
const ENABLE_CYCLE_PLAYBACK = false;
const ENABLE_DEMO_CYCLE_PREVIEW = false;

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
  const [isAccessBannerVisible, setIsAccessBannerVisible] = useState(true);
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
    <main className="utility-shell">
      {isAccessBannerVisible ? (
        <section className="glass-card access-banner">
          <div className="access-banner-main">
            <div className="access-banner-copy">
              <strong className="banner-title">Free access</strong>
              <p>
                This browser utility currently includes Instruments and Grid. Additional guided workflows remain hidden for paid unlocks.
              </p>
            </div>

            <div className="access-banner-actions">
              <span className="status-pill">
                {demoAccess.expired
                  ? "Demo period ended"
                  : `Time remaining: ${formatCountdown(demoAccess.remainingSeconds)}`}
              </span>
              <button
                type="button"
                className={accessMode === "signup" ? "primary-button" : "secondary-button"}
                onClick={() => setAccessMode(accessMode === "signup" ? "guest" : "signup")}
              >
                {accessMode === "signup" ? "Hide email form" : "Get product updates"}
              </button>
              <button
                type="button"
                className="dismiss-button"
                onClick={() => setIsAccessBannerVisible(false)}
                aria-label="Dismiss free access banner"
              >
                Hide banner
              </button>
            </div>
          </div>

          {accessMode === "signup" ? (
            <form className="signup-form access-banner-form" onSubmit={handleSignupSubmit}>
              <input
                type="email"
                aria-label="Email for product updates"
                placeholder="Email for product updates"
                value={signupEmail}
                onChange={(event) => setSignupEmail(event.target.value)}
              />
              <button type="submit" className="primary-button">
                Save for this session
              </button>
            </form>
          ) : null}

          {signupSubmitted ? <p className="helper-copy">Signup interest saved in this session only.</p> : null}
        </section>
      ) : null}

      <header className="utility-header">
        <div className="utility-brand">
          <h1>ToneSmith</h1>
          <p>Browser tone utility</p>
        </div>

        <div className="utility-header-actions">
          <div className="tab-row" role="tablist" aria-label="ToneSmith views">
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

          <div className="workspace-pills">
            <span className="status-pill status-pill-soft">
              {demoAccess.expired
                ? "Demo period ended"
                : `Time remaining: ${formatCountdown(demoAccess.remainingSeconds)}`}
            </span>
            {!isAccessBannerVisible ? (
              <button type="button" className="secondary-button" onClick={() => setIsAccessBannerVisible(true)}>
                Show access banner
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {activeTab === "instruments" ? (
        <section className="glass-card instrument-panel">
          <div className="section-header utility-section-header">
            <div>
              <h2>Instruments</h2>
              <p>Select an instrument and hold or release each open string.</p>
            </div>

            <div className="instrument-panel-actions">
              <label className="field compact-field">
                <span>Instrument</span>
                <select value={instrumentId} onChange={(event) => setInstrumentId(event.target.value)} disabled={demoAccess.expired}>
                  {instruments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="string-list">
            {instrument.strings.map((string, index) => {
              const shiftedNote = transposeNote(string.note, octaveShift * 12);
              const isActive = activeLiveNotes.has(shiftedNote);

              return (
                <div
                  key={`${string.label}-${index}`}
                  className="string-card"
                  style={{ "--string-accent": SPECTRUM_SWATCHES[index % SPECTRUM_SWATCHES.length] }}
                >
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
        </section>
      ) : (
        <section className="glass-card grid-panel">
          <div className="section-header utility-section-header">
            <div>
              <h2>Grid</h2>
              <p>Tap any note to hold or release it directly from the chromatic grid.</p>
            </div>
            <div className="grid-actions">
              <div className="status-pill status-pill-soft">
                {activeLiveNotes.size ? `${activeLiveNotes.size} active tones` : "No active tones"}
              </div>
              <button type="button" className="secondary-button" onClick={handleClearLiveNotes} disabled={demoAccess.expired}>
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
                      style={{ "--tone-color": SPECTRUM_SWATCHES[actualNoteIndex % SPECTRUM_SWATCHES.length] }}
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
