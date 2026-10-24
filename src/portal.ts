import type { Context } from "hono";
import { createSession, sessionCookie, verifyPassword } from "./auth";
import { answerString, fieldVisible, type FieldDef } from "./fields";
import { loadFields as loadFieldsFromApply, parseAnswers as parseAnswersFromApply } from "./apply";
import { appShell } from "./layout";
import type { Env, SessionUser } from "./types";
import { categoryLabel, esc, feeBox, formatWhen, newId, nowIso, safeFilename } from "./util";

type Ctx = Context<{ Bindings: Env; Variables: { user: SessionUser | null } }>;

type MerchantApp = {
  id: string;
  public_ref: string;
  category: string;
  buyer_type: string | null;
  answers_json: string;
  fee_status: string;
  created_at: string;
  parent_application_id: string | null;
  status_label: string | null;
  email: string;
  legal_business_name: string;
};

const APP_COLUMNS = `a.id, a.public_ref, a.category, a.buyer_type, a.answers_json, a.fee_status, a.created_at, a.parent_application_id, a.email, a.legal_business_name, s.label AS status_label`;

export function loginPage(c: Ctx, error = ""): Response {
  const next = safeNext(new URL(c.req.url).searchParams.get("next"));
  const body = `<article class="narrow">
    <h1>Merchant sign in</h1>
    <p>Use the email and password from your application.</p>
    ${error ? `<p class="errors" role="alert">${esc(error)}</p>` : ""}
    <form class="stack-form" method="post" action="/portal/login">
      <input type="hidden" name="next" value="${esc(next)}">
      <label>Email<input type="email" name="email" required autocomplete="username"></label>
      <label>Password<input type="password" name="password" required autocomplete="current-password"></label>
      <button class="btn-p" type="submit">Sign in</button>
    </form>
  </article>`;
  return c.html(shell(c, "Merchant sign in", "/portal/login", body), error ? 401 : 200);
}

export async function login(c: Ctx): Promise<Response> {
  const form = await c.req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const next = safeNext(String(form.get("next") || ""));
  const user = await c.env.DB.prepare("SELECT id, password_hash, role FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string; password_hash: string; role: string }>();
  if (!user || user.role !== "merchant" || !(await verifyPassword(password, user.password_hash))) {
    return loginPage(c, "That email and password did not match a merchant portal.");
  }
  const token = await createSession(c.env.DB, user.id);
  const headers = new Headers({ Location: next });
  headers.append("Set-Cookie", sessionCookie(token, new URL(c.req.url).protocol === "https:"));
  return new Response(null, { status: 303, headers });
}

export async function home(c: Ctx): Promise<Response> {
  const user = c.get("user")!;
  const rows = await c.env.DB.prepare(
    `SELECT ${APP_COLUMNS} FROM applications a LEFT JOIN statuses s ON s.id = a.status_id WHERE a.merchant_user_id = ? ORDER BY a.created_at DESC`,
  )
    .bind(user.id)
    .all<MerchantApp>();
  const list = (rows.results || [])
    .map(
      (app) => `<li><a href="/portal/app/${esc(app.public_ref)}"><strong>${esc(app.public_ref)}</strong> ${esc(categoryLabel(app.category))}</a><span>${esc(app.status_label || "Application received")} · ${esc(formatWhen(app.created_at))}</span></li>`,
    )
    .join("");
  const body = `<h1>Your applications</h1>${list ? `<ul class="plain-list">${list}</ul>` : "<p>No application is on this login yet.</p>"}<p><a href="/apply">Start another application</a></p>`;
  return c.html(shell(c, "Merchant portal", "/portal", body));
}

export async function applicationPage(c: Ctx, ref: string, notice = ""): Promise<Response> {
  const user = c.get("user")!;
  const app = await owned(c, ref, user.id);
  if (!app) return c.html(shell(c, "Not found", "/portal", "<h1>Application not found</h1>"), 404);
  const fields = await loadFieldsFromApply(c.env.DB);
  const answers = parseAnswersFromApply(app.answers_json);
  const uploads = await c.env.DB.prepare("SELECT id, field_key, filename, created_at FROM uploads WHERE application_id = ? ORDER BY created_at")
    .bind(app.id)
    .all<{ id: string; field_key: string; filename: string; created_at: string }>();
  const events = await c.env.DB.prepare(
    "SELECT body, created_at FROM timeline_events WHERE application_id = ? AND merchant_visible = 1 ORDER BY created_at",
  )
    .bind(app.id)
    .all<{ body: string; created_at: string }>();
  const tickets = await c.env.DB.prepare(
    `SELECT t.id, t.subject, t.status, t.created_at, tt.label AS type_label
     FROM tickets t LEFT JOIN ticket_types tt ON tt.id = t.ticket_type_id
     WHERE t.application_id = ? ORDER BY t.created_at`,
  )
    .bind(app.id)
    .all<{ id: string; subject: string; status: string; created_at: string; type_label: string | null }>();
  const types = await c.env.DB.prepare("SELECT id, label FROM ticket_types WHERE active = 1 ORDER BY sort_order").all<{ id: string; label: string }>();
  const children = await c.env.DB.prepare(
    `SELECT public_ref, category FROM applications WHERE parent_application_id = ? AND merchant_user_id = ?`,
  )
    .bind(app.id, user.id)
    .all<{ public_ref: string; category: string }>();
  const messages = new Map<string, { body: string; author_role: string; created_at: string }[]>();
  for (const ticket of tickets.results || []) {
    const msgs = await c.env.DB.prepare(
      "SELECT body, author_role, created_at FROM ticket_messages WHERE ticket_id = ? AND merchant_visible = 1 ORDER BY created_at",
    )
      .bind(ticket.id)
      .all<{ body: string; author_role: string; created_at: string }>();
    messages.set(ticket.id, msgs.results || []);
  }
  const answerHtml = fields
    .filter((field) => field.field_type !== "file" && fieldVisible(field, app.category, app.buyer_type, answers))
    .map((field) => {
      const value = answers[field.key];
      if (!answerString(value)) return "";
      const shown = field.key === "website_password" ? "On file" : displayValue(field, value);
      return `<div><dt>${esc(field.label)}</dt><dd>${esc(shown)}</dd></div>`;
    })
    .join("");
  const fileFields = fields.filter((field) => field.field_type === "file" && field.categories.includes(app.category) && field.active);
  const uploadHtml = (uploads.results || [])
    .map((file) => {
      const label = fields.find((field) => field.key === file.field_key)?.label || "Document";
      return `<li><a href="/portal/files/${esc(file.id)}">${esc(label)}: ${esc(file.filename)}</a> <span>${esc(formatWhen(file.created_at))}</span></li>`;
    })
    .join("");
  const timeline = (events.results || [])
    .map((event) => `<li><time>${esc(formatWhen(event.created_at))}</time><p>${esc(event.body)}</p></li>`)
    .join("");
  const ticketHtml = (tickets.results || [])
    .map((ticket) => {
      const thread = (messages.get(ticket.id) || [])
        .map((msg) => `<p><strong>${msg.author_role === "admin" ? "PaycoreOS" : "You"}</strong> · ${esc(formatWhen(msg.created_at))}<br>${esc(msg.body)}</p>`)
        .join("");
      return `<article class="ticket"><h3>${esc(ticket.subject)}</h3><p>${esc(ticket.type_label || "Ticket")} · ${esc(ticket.status)}</p>${thread}
        <form method="post" action="/portal/tickets/${esc(ticket.id)}/reply" class="stack-form">
          <label>Reply<textarea name="body" required></textarea></label>
          <button class="btn-s" type="submit">Send reply</button>
        </form>
      </article>`;
    })
    .join("");
  const upsell =
    app.category === "dispute-defense" && (children.results || []).length === 0
      ? `<aside class="fee-box"><h2>Optional processing application</h2><p>Dispute defense does not include a merchant account. If you also want PaycoreOS to place processing, you can start that application from the portal. You do not have to.</p><p><a class="btn-s" href="/apply?upsell=1&parent=${esc(app.public_ref)}">Start a processing application</a></p></aside>`
      : (children.results || []).map((child) => `<p>Processing application: <a href="/portal/app/${esc(child.public_ref)}">${esc(child.public_ref)}</a> (${esc(categoryLabel(child.category))})</p>`).join("");
  const openFields = fields
    .filter((field) => field.active && field.categories.includes(app.category) && field.field_type !== "file" && !answerString(answers[field.key]))
    .map((field) => `<label>${esc(field.label)}<input name="f_${esc(field.key)}"></label>`)
    .join("");
  const body = `<p class="k">${esc(app.public_ref)}</p><h1>${esc(app.legal_business_name || categoryLabel(app.category))}</h1>
    ${notice ? `<p class="ok" role="status">${esc(notice)}</p>` : ""}
    <p>Status: ${esc(app.status_label || "Application received")}. Category: ${esc(categoryLabel(app.category))}.</p>
    ${feeBox()}
    ${upsell}
    <h2>Timeline</h2>
    <ol class="timeline">${timeline || "<li>Application received.</li>"}</ol>
    <h2>What you sent</h2>
    <dl class="answers">${answerHtml}</dl>
    <h2>Uploads</h2>
    <ul class="plain-list">${uploadHtml || "<li>No files yet.</li>"}</ul>
    <form class="stack-form" method="post" action="/portal/app/${esc(app.public_ref)}/upload" enctype="multipart/form-data">
      <label>Which document
        <select name="field_key">
          ${fileFields.map((field) => `<option value="${esc(field.key)}">${esc(field.label)}</option>`).join("")}
          <option value="other">Other document</option>
        </select>
      </label>
      <label>File<input type="file" name="upload" required></label>
      <button class="btn-s" type="submit">Upload</button>
    </form>
    ${
      openFields
        ? `<h2>Add an answer</h2><form class="stack-form" method="post" action="/portal/app/${esc(app.public_ref)}/answers">${openFields}<button class="btn-s" type="submit">Save answers</button></form>`
        : ""
    }
    <h2>Tickets</h2>
    ${ticketHtml || "<p>No tickets yet.</p>"}
    <form class="stack-form" method="post" action="/portal/app/${esc(app.public_ref)}/tickets">
      <h2>Open a ticket</h2>
      <label>Type<select name="ticket_type_id">${(types.results || []).map((type) => `<option value="${esc(type.id)}">${esc(type.label)}</option>`).join("")}</select></label>
      <label>Subject<input name="subject" required></label>
      <label>Message<textarea name="body" required></textarea></label>
      <button class="btn-p" type="submit">Open ticket</button>
    </form>`;
  return c.html(shell(c, app.public_ref, "/portal", body));
}

export async function upload(c: Ctx, ref: string): Promise<Response> {
  const user = c.get("user")!;
  const app = await owned(c, ref, user.id);
  if (!app) return c.redirect("/portal");
  const form = await c.req.formData();
  const fieldKey = String(form.get("field_key") || "other");
  const file = form.get("upload");
  if (!(file instanceof File) || file.size === 0) return applicationPage(c, ref, "Choose a file.");
  if (file.size > 10 * 1024 * 1024) return applicationPage(c, ref, "That file is over 10 MB.");
  const id = newId("upl");
  const filename = safeFilename(file.name);
  const r2 = `applications/${app.id}/${id}-${filename}`;
  await c.env.FILES.put(r2, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
  const stamp = nowIso();
  await c.env.DB.prepare("INSERT INTO uploads (id, application_id, field_key, filename, r2_key, content_type, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, app.id, fieldKey, filename, r2, file.type || "application/octet-stream", file.size, stamp)
    .run();
  await c.env.DB.prepare(
    "INSERT INTO timeline_events (id, application_id, body, merchant_visible, email_queued, created_by, created_at) VALUES (?, ?, ?, 1, 0, ?, ?)",
  )
    .bind(newId("evt"), app.id, `File uploaded: ${filename}`, user.id, stamp)
    .run();
  return c.redirect(`/portal/app/${ref}`);
}

export async function saveAnswers(c: Ctx, ref: string): Promise<Response> {
  const user = c.get("user")!;
  const app = await owned(c, ref, user.id);
  if (!app) return c.redirect("/portal");
  const form = await c.req.formData();
  const answers = parseAnswersFromApply(app.answers_json);
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("f_") || typeof value !== "string") continue;
    const clean = value.trim().slice(0, 4000);
    if (clean) answers[key.slice(2)] = clean;
  }
  await c.env.DB.prepare("UPDATE applications SET answers_json = ?, updated_at = ? WHERE id = ? AND merchant_user_id = ?")
    .bind(JSON.stringify(answers), nowIso(), app.id, user.id)
    .run();
  return c.redirect(`/portal/app/${ref}`);
}

export async function openTicket(c: Ctx, ref: string): Promise<Response> {
  const user = c.get("user")!;
  const app = await owned(c, ref, user.id);
  if (!app) return c.redirect("/portal");
  const form = await c.req.formData();
  const subject = String(form.get("subject") || "").trim().slice(0, 200);
  const body = String(form.get("body") || "").trim().slice(0, 4000);
  const typeId = String(form.get("ticket_type_id") || "");
  if (!subject || !body) return applicationPage(c, ref, "A ticket needs a subject and a message.");
  const stamp = nowIso();
  const ticketId = newId("tkt");
  await c.env.DB.prepare(
    "INSERT INTO tickets (id, application_id, ticket_type_id, subject, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, 'open', ?, ?, ?)",
  )
    .bind(ticketId, app.id, typeId || null, subject, user.id, stamp, stamp)
    .run();
  await c.env.DB.prepare(
    "INSERT INTO ticket_messages (id, ticket_id, body, author_role, merchant_visible, email_queued, created_by, created_at) VALUES (?, ?, ?, 'merchant', 1, 0, ?, ?)",
  )
    .bind(newId("msg"), ticketId, body, user.id, stamp)
    .run();
  await c.env.DB.prepare(
    "INSERT INTO timeline_events (id, application_id, body, merchant_visible, email_queued, created_by, created_at) VALUES (?, ?, ?, 1, 0, ?, ?)",
  )
    .bind(newId("evt"), app.id, `You opened a ticket: ${subject}`, user.id, stamp)
    .run();
  return c.redirect(`/portal/app/${ref}`);
}

export async function replyTicket(c: Ctx, ticketId: string): Promise<Response> {
  const user = c.get("user")!;
  const ticket = await c.env.DB.prepare(
    `SELECT t.id, t.application_id, a.public_ref FROM tickets t JOIN applications a ON a.id = t.application_id
     WHERE t.id = ? AND a.merchant_user_id = ?`,
  )
    .bind(ticketId, user.id)
    .first<{ id: string; application_id: string; public_ref: string }>();
  if (!ticket) return c.redirect("/portal");
  const form = await c.req.formData();
  const body = String(form.get("body") || "").trim().slice(0, 4000);
  if (!body) return c.redirect(`/portal/app/${ticket.public_ref}`);
  const stamp = nowIso();
  await c.env.DB.prepare(
    "INSERT INTO ticket_messages (id, ticket_id, body, author_role, merchant_visible, email_queued, created_by, created_at) VALUES (?, ?, ?, 'merchant', 1, 0, ?, ?)",
  )
    .bind(newId("msg"), ticket.id, body, user.id, stamp)
    .run();
  await c.env.DB.prepare("UPDATE tickets SET updated_at = ?, status = 'open' WHERE id = ?").bind(stamp, ticket.id).run();
  await c.env.DB.prepare(
    "INSERT INTO timeline_events (id, application_id, body, merchant_visible, email_queued, created_by, created_at) VALUES (?, ?, ?, 1, 0, ?, ?)",
  )
    .bind(newId("evt"), ticket.application_id, "You replied to a ticket.", user.id, stamp)
    .run();
  return c.redirect(`/portal/app/${ticket.public_ref}`);
}

export async function download(c: Ctx, id: string): Promise<Response> {
  const user = c.get("user")!;
  const row = await c.env.DB.prepare(
    `SELECT u.r2_key, u.filename, u.content_type FROM uploads u
     JOIN applications a ON a.id = u.application_id
     WHERE u.id = ? AND a.merchant_user_id = ?`,
  )
    .bind(id, user.id)
    .first<{ r2_key: string; filename: string; content_type: string }>();
  if (!row) return c.text("Not found", 404);
  const object = await c.env.FILES.get(row.r2_key);
  if (!object) return c.text("Not found", 404);
  const headers = new Headers();
  headers.set("Content-Type", "application/octet-stream");
  headers.set("Content-Disposition", `attachment; filename="${row.filename.replace(/"/g, "")}"`);
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}

async function owned(c: Ctx, ref: string, userId: string): Promise<MerchantApp | null> {
  return c.env.DB.prepare(
    `SELECT ${APP_COLUMNS} FROM applications a LEFT JOIN statuses s ON s.id = a.status_id WHERE a.public_ref = ? AND a.merchant_user_id = ?`,
  )
    .bind(ref, userId)
    .first<MerchantApp>();
}

function displayValue(field: FieldDef, value: string | string[] | undefined): string {
  const raw = answerString(value);
  if (!field.options) return raw;
  const parts = Array.isArray(value) ? value : raw.split(",");
  return parts.map((part) => field.options!.find((opt) => opt.value === part)?.label || part).join(", ");
}

function shell(c: Ctx, title: string, path: string, body: string): string {
  return appShell({ title, hostname: new URL(c.req.url).hostname, path, kind: "portal", body });
}

export function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/portal";
  return value;
}
