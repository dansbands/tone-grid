export const TONE_CONDITIONER_BASE_URL =
  import.meta.env.VITE_TONE_CONDITIONER_BASE_URL || "https://toneconditioner.example.com";

export const TONE_CONDITIONER_HANDOFF_REFS = {
  portfolioCta: "portfolio_cta",
  demoGate: "demo_gate",
  emailExtensionExpired: "email_extension_expired",
  upgradeButton: "upgrade_button",
};

const SUPPORTED_HANDOFF_REFS = new Set(Object.values(TONE_CONDITIONER_HANDOFF_REFS));

export function buildToneConditionerHandoffUrl({
  baseUrl = TONE_CONDITIONER_BASE_URL,
  ref,
}) {
  if (!SUPPORTED_HANDOFF_REFS.has(ref)) {
    throw new Error(`Unsupported ToneConditioner handoff ref: ${ref}`);
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  return `${normalizedBaseUrl}/from/tonegrid?ref=${encodeURIComponent(ref)}`;
}

export function getToneConditionerHandoffUrl(ref) {
  return buildToneConditionerHandoffUrl({ ref });
}
