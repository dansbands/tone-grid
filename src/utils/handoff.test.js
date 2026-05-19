import { describe, expect, it } from "vitest";
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
});
