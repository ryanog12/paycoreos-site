export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function hex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function newId(prefix: string): string {
  return `${prefix}_${hex(crypto.getRandomValues(new Uint8Array(12)))}`;
}

export function publicRef(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `PC-${out}`;
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function cleanText(value: string, max: number): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

export function safeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() || "upload";
  const cleaned = base.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120);
  return cleaned || "upload";
}

export function paymentsEnabled(env: { FEE_PAYMENTS_ENABLED?: string }): boolean {
  return env.FEE_PAYMENTS_ENABLED === "true";
}

export const FEE_CENTS = 3900;
export const COMPANY = "PaycoreOS, a DBA of Telecom Elite, Inc.";
export const STREET = "1809 E Broadway St";
export const LOCALITY = "Oviedo, FL 32765";
export const ADDRESS = `${STREET}, ${LOCALITY}`;
export const PHONE_DISPLAY = "(407) 270-2502";
export const PHONE_TEL = "+14072702502";
export const EMAIL = "info@paycoreos.com";
export const SITE_ORIGIN = "https://paycoreos.com";
export const FOOTER_LINE = `${COMPANY}, ${ADDRESS}, ${PHONE_DISPLAY}, ${EMAIL}.`;

export const FEE_DISCLOSURE =
  "PaycoreOS, a DBA of Telecom Elite, Inc., 1809 E Broadway St, Oviedo, FL 32765, (407) 270-2502, charges a $39 application fee to review this application and submit it. The fee is not a processing rate, not a hardware deposit, and not your merchant account. We do not tell you which company receives the file. The fee is not refunded if you are declined, if you cancel after we can submit it, or if you stop responding. If we ask for a document or an answer we need in order to review or submit, and you do not provide it, the fee is not refunded. No response for 10 business days counts as stopping. The fee is refunded only when we cannot submit for a reason on our side, within 10 business days. A decline is not a refund. Customer payments for your business are not taken through this fee.";

export function feeBox(): string {
  return `<aside class="fee-box">
    <p>${FEE_DISCLOSURE}</p>
    <p><strong>The fee is not collected until the fee account is ready.</strong></p>
  </aside>`;
}

export const CATEGORIES = [
  { value: "call-centers", label: "Call centers", path: "/call-centers" },
  { value: "ecommerce", label: "eCommerce", path: "/ecommerce" },
  { value: "retail", label: "Retail", path: "/retail" },
  { value: "restaurants", label: "Restaurants", path: "/restaurants" },
  { value: "dispute-defense", label: "Dispute defense", path: "/dispute-defense" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const PROCESSING_CATEGORIES: CategoryValue[] = ["call-centers", "ecommerce", "retail", "restaurants"];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function isCategory(value: string): value is CategoryValue {
  return CATEGORIES.some((c) => c.value === value);
}

export function buyerLabel(value: string | null): string {
  if (value === "existing") return "I already accept cards";
  if (value === "first") return "This is my first merchant account";
  return "";
}
