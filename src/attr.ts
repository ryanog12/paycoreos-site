import type { Attr, AttrKey } from "./types";
import { ATTR_KEYS } from "./types";
import { readCookie } from "./auth";

const VERTICALS: Record<string, string> = {
  "/call-centers": "call-centers",
  "/ecommerce": "ecommerce",
  "/retail": "retail",
  "/restaurants": "restaurants",
  "/dispute-defense": "dispute-defense",
};

export function parseAttr(url: URL, cookieHeader: string | undefined): { attr: Attr; dirty: boolean } {
  let current: Attr = {};
  const raw = readCookie(cookieHeader, "paycore_attr");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Attr;
      if (parsed && typeof parsed === "object") current = parsed;
    } catch {
      current = {};
    }
  }
  const next: Attr = { ...current };
  let dirty = !raw;
  for (const key of ATTR_KEYS) {
    const value = clip(url.searchParams.get(key));
    if (value && next[key] !== value) {
      next[key] = value;
      dirty = true;
    }
  }
  if (!next.first_landing_path) {
    next.first_landing_path = url.pathname;
    dirty = true;
  }
  const vertical = VERTICALS[url.pathname];
  if (vertical && !next.first_vertical) {
    next.first_vertical = vertical;
    dirty = true;
  }
  if (url.pathname === "/switching" && !next.first_buyer_type) {
    next.first_buyer_type = "existing";
    dirty = true;
  }
  if (url.pathname === "/startups" && !next.first_buyer_type) {
    next.first_buyer_type = "first";
    dirty = true;
  }
  const buyer = url.searchParams.get("buyer");
  if ((buyer === "existing" || buyer === "first") && !next.first_buyer_type) {
    next.first_buyer_type = buyer;
    dirty = true;
  }
  return { attr: next, dirty };
}

function clip(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, 300);
  return trimmed || undefined;
}

export function attrCookie(attr: Attr, secure: boolean): string {
  const value = encodeURIComponent(JSON.stringify(attr));
  const flags = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${90 * 24 * 60 * 60}${secure ? "; Secure" : ""}`;
  return `paycore_attr=${value}; ${flags}`;
}

export function attrFromRequest(url: URL, cookieHeader: string | undefined, form?: FormData): Attr {
  const { attr } = parseAttr(url, cookieHeader);
  if (!form) return attr;
  for (const key of ATTR_KEYS) {
    const value = clip(typeof form.get(key) === "string" ? String(form.get(key)) : null);
    if (value) attr[key] = value;
  }
  return attr;
}

export function hiddenAttr(attr: Attr): string {
  return ATTR_KEYS.map((key) => {
    const value = attr[key];
    if (!value) return "";
    return `<input type="hidden" name="${key}" value="${escapeAttr(value)}">`;
  }).join("");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function withQuery(path: string, url: URL): string {
  const next = new URL(path, "https://paycoreos.com");
  for (const key of ATTR_KEYS) {
    const value = url.searchParams.get(key);
    if (value) next.searchParams.set(key, value);
  }
  return next.pathname + next.search;
}

export function syncAttrHeader(c: { req: { url: string; header(name: string): string | undefined } }): string | null {
  const url = new URL(c.req.url);
  const { attr, dirty } = parseAttr(url, c.req.header("cookie"));
  if (!dirty) return null;
  return attrCookie(attr, url.protocol === "https:");
}

export function readAttrKey(attr: Attr, key: AttrKey): string | null {
  return attr[key] ?? null;
}
