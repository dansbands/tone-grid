export function getDemoAccessState({ startedAt, now, durationSeconds }) {
  const elapsedSeconds = Math.max(Math.floor((now - startedAt) / 1000), 0);
  const remainingSeconds = Math.max(durationSeconds - elapsedSeconds, 0);

  return {
    elapsedSeconds,
    remainingSeconds,
    expired: remainingSeconds === 0,
  };
}

export function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}