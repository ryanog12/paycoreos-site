import { EMAIL, newId, nowIso } from "./util";

export async function queueEmail(
  db: D1Database,
  input: { to: string; subject: string; body: string; applicationId: string | null },
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO email_outbox (id, to_email, from_email, subject, body, application_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'queued', ?)",
    )
    .bind(newId("mail"), input.to, EMAIL, input.subject, input.body, input.applicationId, nowIso())
    .run();
}

export function merchantEmailBody(ref: string, message: string): string {
  return `PaycoreOS, a DBA of Telecom Elite, Inc.

Application ${ref}

${message}

Sign in to the merchant portal to see the timeline and to upload a file.
This address is info@paycoreos.com.

1809 E Broadway St, Oviedo, FL 32765
(407) 270-2502`;
}
