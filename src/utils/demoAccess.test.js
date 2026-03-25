import { describe, expect, it } from "vitest";
import { formatCountdown, getDemoAccessState } from "./demoAccess";

describe("getDemoAccessState", () => {
  it("reports remaining demo time before expiry", () => {
    const state = getDemoAccessState({
      startedAt: 0,
      now: 30_000,
      durationSeconds: 120,
    });

    expect(state.remainingSeconds).toBe(90);
    expect(state.expired).toBe(false);
  });

  it("reports expiry when the demo duration is exhausted", () => {
    const state = getDemoAccessState({
      startedAt: 0,
      now: 200_000,
      durationSeconds: 120,
    });

    expect(state.remainingSeconds).toBe(0);
    expect(state.expired).toBe(true);
  });
});

describe("formatCountdown", () => {
  it("formats minutes and seconds for the guest timer", () => {
    expect(formatCountdown(125)).toBe("2:05");
  });
});