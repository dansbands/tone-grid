import { noteToFrequency } from "./notes";

// Browser setTimeout delay is stored as a 32-bit signed integer; values
// exceeding this limit cause the timer to fire immediately (or not at all).
const MAX_TIMEOUT_MS = 2147483647; // 2^31 - 1

export function createTonePlayer({ onStepChange, onPlaybackStateChange } = {}) {
  let audioContext = null;
  let timers = [];
  let activeNodes = [];
  let playbackToken = 0;

  async function ensureAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return audioContext;
  }

  function clearTimers() {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  }

  function stopActiveTone(fadeSeconds = 0.45) {
    if (!audioContext || !activeNodes.length) {
      activeNodes = [];
      return;
    }

    const now = audioContext.currentTime;

    activeNodes.forEach(({ oscillator, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
        oscillator.stop(now + fadeSeconds + 0.05);
      } catch {
        // Ignore already-stopped nodes.
      }
    });

    activeNodes = [];
  }

  function stop() {
    playbackToken += 1;
    clearTimers();
    stopActiveTone(0.3);
    onStepChange?.(-1);
    onPlaybackStateChange?.(false);
  }

  async function playStep(step) {
    const context = await ensureAudioContext();
    const now = context.currentTime;
    const durationSeconds = Math.max(step.durationSeconds, 0.5);
    const fadeInSeconds = Math.min(0.6, durationSeconds * 0.15);
    const fadeOutSeconds = Math.min(0.8, durationSeconds * 0.18);
    const fadeOutStart = Math.max(now + durationSeconds - fadeOutSeconds, now + 0.2);
    const targetGain = 0.18 / Math.max(step.notes.length, 1);

    stopActiveTone(0.35);

    const stepNodes = step.notes.map((note) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = noteToFrequency(note);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(targetGain, now + fadeInSeconds);
      gain.gain.setValueAtTime(targetGain, fadeOutStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, fadeOutStart + fadeOutSeconds);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(fadeOutStart + fadeOutSeconds + 0.05);

      return { oscillator, gain };
    });

    activeNodes = stepNodes;

    const releaseTimer = window.setTimeout(() => {
      if (activeNodes.every((node) => stepNodes.includes(node))) {
        activeNodes = [];
      }
    }, Math.min((durationSeconds + 0.2) * 1000, MAX_TIMEOUT_MS));

    timers.push(releaseTimer);
  }

  async function playSequence({ steps, loop = true, runForSeconds = null }) {
    if (!steps.length) {
      return;
    }

    stop();

    const currentToken = playbackToken;
    const stepDurationsMs = steps.map((step) => step.durationSeconds * 1000);
    const totalDurationMs = stepDurationsMs.reduce(
      (total, duration) => total + duration,
      0
    );
    const stopAfterMs =
      typeof runForSeconds === "number" && Number.isFinite(runForSeconds)
        ? Math.max(runForSeconds * 1000, totalDurationMs)
        : null;

    await ensureAudioContext();

    if (stopAfterMs !== null) {
      timers.push(
        window.setTimeout(() => {
          if (currentToken !== playbackToken) {
            return;
          }

          stop();
        }, Math.min(stopAfterMs, MAX_TIMEOUT_MS))
      );
    }

    function schedulePass() {
      let elapsed = 0;

      steps.forEach((step, index) => {
        const timer = window.setTimeout(() => {
          if (currentToken !== playbackToken) {
            return;
          }

          onStepChange?.(index);
          playStep(step);
        }, Math.min(elapsed, MAX_TIMEOUT_MS));

        timers.push(timer);
        elapsed += stepDurationsMs[index];
      });

      const completionTimer = window.setTimeout(() => {
        if (currentToken !== playbackToken) {
          return;
        }

        if (loop && (stopAfterMs === null || totalDurationMs < stopAfterMs)) {
          schedulePass();
          return;
        }

        stop();
      }, Math.min(totalDurationMs, MAX_TIMEOUT_MS));

      timers.push(completionTimer);
    }

    onPlaybackStateChange?.(true);
    schedulePass();
  }

  function dispose() {
    stop();

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }

  return {
    playSequence,
    stop,
    dispose,
  };
}

export function createLiveNotePlayer() {
  let audioContext = null;
  const activeNodes = new Map();

  async function ensureAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return audioContext;
  }

  async function startNote(note) {
    if (activeNodes.has(note)) {
      return true;
    }

    const context = await ensureAudioContext();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = noteToFrequency(note);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    activeNodes.set(note, { oscillator, gain });

    return true;
  }

  function stopNote(note, fadeSeconds = 0.18) {
    if (!audioContext || !activeNodes.has(note)) {
      activeNodes.delete(note);
      return false;
    }

    const now = audioContext.currentTime;
    const { oscillator, gain } = activeNodes.get(note);

    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
      oscillator.stop(now + fadeSeconds + 0.05);
    } catch {
      // Ignore already-stopped nodes.
    }

    activeNodes.delete(note);
    return false;
  }

  async function toggleNote(note) {
    if (activeNodes.has(note)) {
      stopNote(note);
      return false;
    }

    await startNote(note);
    return true;
  }

  function stopAll() {
    Array.from(activeNodes.keys()).forEach((note) => {
      stopNote(note, 0.2);
    });
  }

  function dispose() {
    stopAll();

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }

  return {
    toggleNote,
    stopAll,
    dispose,
  };
}