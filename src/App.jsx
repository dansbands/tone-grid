import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { instruments } from "../config/instruments.ts";
import { presetCategories, presets } from "../config/presets.ts";
import { createTonePlayer } from "./utils/audio";
import { formatNote } from "./utils/notes";
import { resolvePresetPattern } from "./utils/patterns";

const DURATION_UNIT_OPTIONS = [
  { value: "seconds", label: "Seconds", multiplier: 1 },
  { value: "minutes", label: "Minutes", multiplier: 60 },
  { value: "hours", label: "Hours", multiplier: 3600 },
];

function getDefaultPreset(category) {
  return presets.find((preset) => preset.category === category)?.id ?? "";
}

function convertDurationToSeconds(value, unit) {
  const selectedUnit = DURATION_UNIT_OPTIONS.find((option) => option.value === unit);
  return Math.max(Number(value) || 1, 1) * (selectedUnit?.multiplier ?? 1);
}

function formatDuration(value, unit) {
  return `${value} ${unit}`;
}

function formatSecondsAsDuration(seconds) {
  if (seconds % 3600 === 0) {
    return formatDuration(seconds / 3600, "hours");
  }

  if (seconds % 60 === 0) {
    return formatDuration(seconds / 60, "minutes");
  }

  return formatDuration(seconds, "seconds");
}

export default function App() {
  const [instrumentId, setInstrumentId] = useState(instruments[0].id);
  const [category, setCategory] = useState(presetCategories[0]);
  const [presetId, setPresetId] = useState(getDefaultPreset(presetCategories[0]));
  const [holdDurationValue, setHoldDurationValue] = useState(15);
  const [holdDurationUnit, setHoldDurationUnit] = useState("seconds");
  const [cycleDurationValue, setCycleDurationValue] = useState(1);
  const [cycleDurationUnit, setCycleDurationUnit] = useState("hours");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const playerRef = useRef(null);
  const selectionKeyRef = useRef("");

  const instrument = useMemo(
    () => instruments.find((item) => item.id === instrumentId) ?? instruments[0],
    [instrumentId]
  );

  const visiblePresets = useMemo(
    () => presets.filter((preset) => preset.category === category),
    [category]
  );

  const preset = useMemo(
    () => visiblePresets.find((item) => item.id === presetId) ?? visiblePresets[0],
    [presetId, visiblePresets]
  );

  const holdDurationSeconds = useMemo(
    () => convertDurationToSeconds(holdDurationValue, holdDurationUnit),
    [holdDurationValue, holdDurationUnit]
  );

  const cycleDurationSeconds = useMemo(
    () => convertDurationToSeconds(cycleDurationValue, cycleDurationUnit),
    [cycleDurationValue, cycleDurationUnit]
  );

  const steps = useMemo(
    () =>
      preset ? resolvePresetPattern(instrument, preset, holdDurationSeconds) : [],
    [instrument, preset, holdDurationSeconds]
  );

  const selectionKey = [
    instrumentId,
    category,
    presetId,
    holdDurationValue,
    holdDurationUnit,
    cycleDurationValue,
    cycleDurationUnit,
  ].join(":");

  useEffect(() => {
    playerRef.current = createTonePlayer({
      onStepChange: setCurrentStepIndex,
      onPlaybackStateChange: setIsPlaying,
    });

    return () => {
      playerRef.current?.dispose();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const nextPresetId = getDefaultPreset(category);

    setPresetId((currentPresetId) => {
      if (visiblePresets.some((item) => item.id === currentPresetId)) {
        return currentPresetId;
      }

      return nextPresetId;
    });
  }, [category, visiblePresets]);

  useEffect(() => {
    if (!selectionKeyRef.current) {
      selectionKeyRef.current = selectionKey;
      return;
    }

    if (selectionKeyRef.current !== selectionKey && isPlaying) {
      playerRef.current?.stop();
    }

    selectionKeyRef.current = selectionKey;
  }, [selectionKey, isPlaying]);

  const handleConditioningToggle = async () => {
    if (!playerRef.current || !preset) {
      return;
    }

    if (isPlaying) {
      playerRef.current.stop();
      return;
    }

    await playerRef.current.playSequence({
      steps,
      loop: true,
      runForSeconds: cycleDurationSeconds,
    });
  };

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  return (
    <main className="app-shell">
      <section className="panel hero-panel">
        <p className="eyebrow">Acoustic tone conditioning</p>
        <h1>Sustained resonance conditioning for common string instruments.</h1>
        <p className="hero-copy">
          Pick an instrument, choose a conditioning preset, and let long-held
          tones energize sympathetic vibration.
        </p>
      </section>

      <section className="panel controls-panel">
        <div className="control-grid">
          <label className="field">
            <span>Instrument</span>
            <select
              value={instrumentId}
              onChange={(event) => setInstrumentId(event.target.value)}
            >
              {instruments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {presetCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Conditioning preset</span>
            <select
              value={preset?.id ?? ""}
              onChange={(event) => setPresetId(event.target.value)}
            >
              {visiblePresets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
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
                onChange={(event) =>
                  setHoldDurationValue(Number(event.target.value) || 1)
                }
              />
              <select
                value={holdDurationUnit}
                onChange={(event) => setHoldDurationUnit(event.target.value)}
              >
                {DURATION_UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <span>Continue resonance cycle for</span>
            <div className="duration-row">
              <input
                type="number"
                min="1"
                step="1"
                value={cycleDurationValue}
                onChange={(event) =>
                  setCycleDurationValue(Number(event.target.value) || 1)
                }
              />
              <select
                value={cycleDurationUnit}
                onChange={(event) => setCycleDurationUnit(event.target.value)}
              >
                {DURATION_UNIT_OPTIONS.filter((option) => option.value !== "seconds").map(
                  (option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="action-row">
          <button className="primary-button" onClick={handleConditioningToggle}>
            {isPlaying ? "Stop conditioning" : "Start conditioning"}
          </button>
          <div className="status-pill">
            {isPlaying && currentStep
              ? `Resonating: ${currentStep.label}`
              : `Cycle length: ${formatDuration(
                  cycleDurationValue,
                  cycleDurationUnit
                )}`}
          </div>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel strings-panel">
          <div className="section-header">
            <h2>{instrument.name}</h2>
            <p>Standard tuning</p>
          </div>

          <div className="string-list">
            {instrument.strings.map((string, index) => (
              <div key={`${string.label}-${index}`} className="string-card">
                <span className="string-label">{string.label}</span>
                <span className="string-note">{formatNote(string.note)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel pattern-panel">
          <div className="section-header">
            <h2>{preset?.name}</h2>
            <p>{steps.length} sustained tones</p>
          </div>

          <div className="pattern-list">
            {steps.map((step, index) => (
              <div
                key={`${step.label}-${index}`}
                className={`pattern-step ${
                  currentStepIndex === index ? "pattern-step-active" : ""
                }`}
              >
                <div>
                  <strong>Tone {index + 1}</strong>
                  <p>{step.label}</p>
                </div>
                <div className="pattern-notes">
                  {step.notes.map((note) => formatNote(note)).join(" + ")} · {formatSecondsAsDuration(
                    step.durationSeconds
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
