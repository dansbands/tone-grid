import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  buildToneConditionerHandoffUrl,
  TONE_CONDITIONER_HANDOFF_REFS,
} from "./handoff";

describe("buildToneConditionerHandoffUrl", () => {
  it("builds the ToneGrid handoff URL with source ref context", () => {
    expect(
      buildToneConditionerHandoffUrl({
        baseUrl: "https://toneconditioner.test",
        ref: TONE_CONDITIONER_HANDOFF_REFS.upgradeButton,
      })
    ).toBe("https://toneconditioner.test/from/tonegrid?ref=upgrade_button");
  });

  it("normalizes a trailing slash on the configured base URL", () => {
    expect(
      buildToneConditionerHandoffUrl({
        baseUrl: "https://toneconditioner.test/",
        ref: TONE_CONDITIONER_HANDOFF_REFS.portfolioCta,
      })
    ).toBe("https://toneconditioner.test/from/tonegrid?ref=portfolio_cta");
  });

  it("supports future demo and email-extension refs", () => {
    expect(
      buildToneConditionerHandoffUrl({
        baseUrl: "https://toneconditioner.test",
        ref: TONE_CONDITIONER_HANDOFF_REFS.demoGate,
      })
    ).toBe("https://toneconditioner.test/from/tonegrid?ref=demo_gate");

    expect(
      buildToneConditionerHandoffUrl({
        baseUrl: "https://toneconditioner.test",
        ref: TONE_CONDITIONER_HANDOFF_REFS.emailExtensionExpired,
      })
    ).toBe("https://toneconditioner.test/from/tonegrid?ref=email_extension_expired");
  });

  it("rejects unknown handoff refs", () => {
    expect(() =>
      buildToneConditionerHandoffUrl({
        baseUrl: "https://toneconditioner.test",
        ref: "unknown_ref",
      })
    ).toThrow("Unsupported ToneConditioner handoff ref");
  });

  it("rejects missing base URL", () => {
    expect(() =>
      buildToneConditionerHandoffUrl({
        baseUrl: null,
        ref: TONE_CONDITIONER_HANDOFF_REFS.upgradeButton,
      })
    ).toThrow("ToneConditioner handoff baseUrl is required");
  });
});

describe("getToneConditionerHandoffUrl", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null and warns when VITE_TONE_CONDITIONER_BASE_URL is not set", async () => {
    vi.stubEnv("VITE_TONE_CONDITIONER_BASE_URL", "");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getToneConditionerHandoffUrl, TONE_CONDITIONER_HANDOFF_REFS: refs } =
      await import("./handoff");

    const result = getToneConditionerHandoffUrl(refs.upgradeButton);

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("VITE_TONE_CONDITIONER_BASE_URL"));

    warnSpy.mockRestore();
  });

  it("returns the handoff URL when VITE_TONE_CONDITIONER_BASE_URL is set", async () => {
    vi.stubEnv("VITE_TONE_CONDITIONER_BASE_URL", "https://toneconditioner.test");

    const { getToneConditionerHandoffUrl, TONE_CONDITIONER_HANDOFF_REFS: refs } =
      await import("./handoff");

    const result = getToneConditionerHandoffUrl(refs.upgradeButton);

    expect(result).toBe("https://toneconditioner.test/from/tonegrid?ref=upgrade_button");
  });
});
