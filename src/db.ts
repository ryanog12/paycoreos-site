import { ensureAdmin } from "./auth";
import type { Env } from "./types";
import { nowIso } from "./util";
import { SEED_FIELDS, SEED_PROCESSORS, SEED_STATUSES, SEED_TICKET_TYPES } from "./seed";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS processors (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  api_credentials TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS field_definitions (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  help_text TEXT NOT NULL DEFAULT '',
  field_type TEXT NOT NULL,
  section TEXT NOT NULL,
  categories TEXT NOT NULL,
  buyer_types TEXT,
  required INTEGER NOT NULL DEFAULT 0,
  multiple INTEGER NOT NULL DEFAULT 0,
  options_json TEXT,
  condition_json TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  screening INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS statuses (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ticket_types (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  public_ref TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  buyer_type TEXT,
  status_id TEXT,
  processor_id TEXT,
  push_target TEXT,
  pushed_at TEXT,
  email TEXT NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  legal_business_name TEXT NOT NULL DEFAULT '',
  answers_json TEXT NOT NULL,
  parent_application_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  gclid TEXT,
  gbraid TEXT,
  wbraid TEXT,
  fbclid TEXT,
  li_fat_id TEXT,
  landing_path TEXT,
  first_vertical TEXT,
  first_buyer_type TEXT,
  fee_status TEXT NOT NULL DEFAULT 'not_collected',
  fee_amount_cents INTEGER NOT NULL DEFAULT 3900,
  merchant_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  field_key TEXT,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  content_type TEXT,
  size INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  status_id TEXT,
  body TEXT NOT NULL,
  merchant_visible INTEGER NOT NULL DEFAULT 1,
  email_queued INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS internal_notes (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  ticket_type_id TEXT,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  body TEXT NOT NULL,
  author_role TEXT NOT NULL,
  merchant_visible INTEGER NOT NULL DEFAULT 1,
  email_queued INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS email_outbox (
  id TEXT PRIMARY KEY,
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  application_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_merchant ON applications(merchant_user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_app ON uploads(application_id);
CREATE INDEX IF NOT EXISTS idx_timeline_app ON timeline_events(application_id);
CREATE INDEX IF NOT EXISTS idx_notes_app ON internal_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_tickets_app ON tickets(application_id);
CREATE INDEX IF NOT EXISTS idx_messages_ticket ON ticket_messages(ticket_id);
`;

let pending: Promise<void> | null = null;

export function boot(env: Env): Promise<void> {
  if (!pending) {
    pending = migrateAndSeed(env).catch((err) => {
      pending = null;
      throw err;
    });
  }
  return pending;
}

async function migrateAndSeed(env: Env): Promise<void> {
  const statements = SCHEMA.split(";").map((sql) => sql.trim()).filter(Boolean);
  for (const sql of statements) await env.DB.prepare(sql).run();
  const seeded = await env.DB.prepare("SELECT value FROM app_meta WHERE key = 'seed'").first<{ value: string }>();
  if (!seeded) {
    const stamp = nowIso();
    const statements = [];
    for (const row of SEED_PROCESSORS) {
      statements.push(
        env.DB.prepare(
          "INSERT OR IGNORE INTO processors (id, slug, name, notes, api_credentials, active, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, 1, ?, ?)",
        ).bind(row.id, row.slug, row.name, row.notes, stamp, stamp),
      );
    }
    for (const row of SEED_STATUSES) {
      statements.push(
        env.DB.prepare(
          "INSERT OR IGNORE INTO statuses (id, key, label, description, sort_order, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)",
        ).bind(row.id, row.key, row.label, row.description, row.sort, stamp, stamp),
      );
    }
    for (const row of SEED_TICKET_TYPES) {
      statements.push(
        env.DB.prepare(
          "INSERT OR IGNORE INTO ticket_types (id, key, label, description, sort_order, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)",
        ).bind(row.id, row.key, row.label, row.description, row.sort, stamp, stamp),
      );
    }
    for (const row of SEED_FIELDS) {
      statements.push(
        env.DB.prepare(
          `INSERT OR IGNORE INTO field_definitions
           (id, key, label, help_text, field_type, section, categories, buyer_types, required, multiple, options_json, condition_json, sort_order, active, screening, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        ).bind(
          row.id,
          row.key,
          row.label,
          row.help,
          row.type,
          row.section,
          JSON.stringify(row.categories),
          row.buyerTypes ? JSON.stringify(row.buyerTypes) : null,
          row.required ? 1 : 0,
          row.multiple ? 1 : 0,
          row.options ? JSON.stringify(row.options) : null,
          row.condition ? JSON.stringify(row.condition) : null,
          row.sort,
          row.screening ? 1 : 0,
          stamp,
          stamp,
        ),
      );
    }
    statements.push(env.DB.prepare("INSERT INTO app_meta (key, value) VALUES ('seed', '1')"));
    await env.DB.batch(statements);
  }
  await ensureAdmin(env);
}
