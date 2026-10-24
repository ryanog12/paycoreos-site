export { SEED_FIELDS } from "./fields";

export const SEED_PROCESSORS = [
  { id: "proc_maverick", slug: "maverick", name: "Maverick", notes: "Admin only. Do not put this name on a public page, in the portal, or in an email." },
  { id: "proc_kurv", slug: "kurv", name: "Kurv", notes: "Admin only. Do not put this name on a public page, in the portal, or in an email." },
  { id: "proc_nexio", slug: "nexio", name: "Nexio", notes: "Admin only. Call centers can be pushed here. Do not put this name on a public page, in the portal, or in an email." },
  { id: "proc_nuvei", slug: "nuvei", name: "Nuvei", notes: "Admin only. Do not put this name on a public page, in the portal, or in an email." },
  { id: "proc_disputifier", slug: "disputifier", name: "Disputifier", notes: "Dispute defense enrollment. Admin only. Do not put this name on a public page, in the portal, or in an email." },
];

export const SEED_STATUSES = [
  { id: "status_received", key: "received", label: "Application received", description: "We have the application.", sort: 10 },
  { id: "status_fee_pending", key: "fee_pending", label: "Fee not collected yet", description: "The $39 fee is not collected until the fee account is ready.", sort: 20 },
  { id: "status_fee_paid", key: "fee_paid", label: "Fee paid", description: "The $39 application fee was paid. Marking this does not charge a card.", sort: 25 },
  { id: "status_in_review", key: "in_review", label: "In review", description: "PaycoreOS is reviewing the application.", sort: 30 },
  { id: "status_waiting", key: "waiting_on_document", label: "Needs a document", description: "We need a document or an answer before we can review or submit.", sort: 40 },
  { id: "status_submitted", key: "submitted", label: "Submitted", description: "The application has been submitted.", sort: 50 },
  { id: "status_approved", key: "approved", label: "Approved", description: "The application was approved.", sort: 60 },
  { id: "status_declined", key: "declined", label: "Declined", description: "The application was declined. A decline is not a refund.", sort: 70 },
];

export const SEED_TICKET_TYPES = [
  { id: "tt_document", key: "document", label: "Document", description: "A file or an answer about a document.", sort: 10 },
  { id: "tt_question", key: "question", label: "Question", description: "A question about the application.", sort: 20 },
  { id: "tt_update", key: "update", label: "Update", description: "A status update.", sort: 30 },
  { id: "tt_other", key: "other", label: "Other", description: "Anything else about the application.", sort: 40 },
];
