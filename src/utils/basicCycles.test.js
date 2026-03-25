import { describe, expect, it } from "vitest";
import { instrumentsById } from "../../config/instruments.ts";
import { buildBasicCycle } from "./basicCycles";

describe("buildBasicCycle", () => {
  it("builds a simple open-string cycle for the selected instrument", () => {
    const cycle = buildBasicCycle({
      instrument: instrumentsById["violin"],
      mode: "up",
      holdDurationSeconds: 15,
      octaveShift: 0,
    });

    expect(cycle).toHaveLength(4);
    expect(cycle[0].notes).toEqual(["G3"]);
    expect(cycle[3].notes).toEqual(["E5"]);
  });

  it("applies octave shifting without introducing premium multi-tone workflows", () => {
    const cycle = buildBasicCycle({
      instrument: instrumentsById["violin"],
      mode: "down",
      holdDurationSeconds: 20,
      octaveShift: 1,
    });

    expect(cycle[0].notes).toEqual(["E6"]);
    expect(cycle.every((step) => step.notes.length === 1)).toBe(true);
  });
});