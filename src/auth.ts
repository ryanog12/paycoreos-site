import type { Env, SessionUser } from "./types";

type CookieSource = { env: Env; req: { header(name: string): string | undefined } };
import { hex, newId, nowIso } from "./util";

const ITERATIONS = 100000;

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${hex(salt)}$${hex(bits)}`;
}

function safeEqual(a: string, b: string): boolean {
  const ae = new TextEncoder().encode(a);
  const be = new TextEncoder().encode(b);
  if (ae.length !== be.length) return false;
  let diff = 0;
  for (let i = 0; i < ae.length; i++) diff |= ae[i]! ^ be[i]!;
  return diff === 0;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 1) return false;
  const salt = hexToBytes(parts[2] || "");
  const expected = parts[3] || "";
  const bits = await derive(password, salt, iterations);
  return safeEqual(hex(bits), expected);
}

function hexToBytes(value: string): Uint8Array {
  const out = new Uint8Array(value.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export async function sha256(value: string): Promise<string> {
  const bits = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return hex(new Uint8Array(bits));
}

export function newToken(): string {
  return hex(crypto.getRandomValues(new Uint8Array(32)));
}

export async function createSession(db: D1Database, userId: string): Promise<string> {
  const token = newToken();
  const tokenHash = await sha256(token);
  const created = nowIso();
  const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  await db
    .prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(newId("ses"), userId, tokenHash, expires, created)
    .run();
  return token;
}

export async function loadUser(c: CookieSource): Promise<SessionUser | null> {
  const token = readCookie(c.req.header("cookie"), "paycore_session");
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.role, u.name, s.expires_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`,
  )
    .bind(tokenHash)
    .first<{ id: string; email: string; role: string; name: string; expires_at: string }>();
  if (!row) return null;
  if (row.expires_at < nowIso()) return null;
  if (row.role !== "admin" && row.role !== "merchant") return null;
  return { id: row.id, email: row.email, role: row.role, name: row.name };
}

export async function destroySession(c: CookieSource): Promise<void> {
  const token = readCookie(c.req.header("cookie"), "paycore_session");
  if (!token) return;
  const tokenHash = await sha256(token);
  await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}

export function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function sessionCookie(token: string, secure: boolean): string {
  const flags = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${14 * 24 * 60 * 60}${secure ? "; Secure" : ""}`;
  return `paycore_session=${token}; ${flags}`;
}

export function clearSessionCookie(secure: boolean): string {
  return `paycore_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
}

export async function ensureAdmin(env: Env): Promise<void> {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD ?? "";
  if (!email || password.length < 10) return;
  const existing = await env.DB.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").first();
  if (existing) return;
  await env.DB.prepare("INSERT INTO users (id, email, password_hash, role, name, created_at) VALUES (?, ?, ?, 'admin', 'PaycoreOS admin', ?)")
    .bind(newId("usr"), email, await hashPassword(password), nowIso())
    .run();
}
