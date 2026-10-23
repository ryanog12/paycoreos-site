export type FieldType = "text" | "email" | "tel" | "textarea" | "select" | "multiselect" | "checkbox" | "file" | "radio";

export type Option = { value: string; label: string };

export type CondRule = { key: string; equals: string };

export type Condition = { any: Condition[] } | { all?: CondRule[]; categories?: string[]; buyer_types?: string[] };

export type FieldDef = {
  id: string;
  key: string;
  label: string;
  help_text: string;
  field_type: FieldType;
  section: string;
  categories: string[];
  buyer_types: string[] | null;
  required: number;
  multiple: number;
  options: Option[] | null;
  condition: Condition | null;
  sort_order: number;
  active: number;
  screening: number;
};

export type Answers = Record<string, string | string[]>;

type SeedField = {
  id: string;
  key: string;
  label: string;
  help: string;
  type: FieldType;
  section: string;
  categories: string[];
  buyerTypes?: string[];
  required?: boolean;
  multiple?: boolean;
  options?: Option[];
  condition?: Condition;
  sort: number;
  screening?: boolean;
};

const FOUR = ["call-centers", "ecommerce", "retail", "restaurants"];
const ALL = [...FOUR, "dispute-defense"];
const CALL_DOCS: Condition = {
  any: [{ categories: ["call-centers"] }, { categories: ["dispute-defense"], all: [{ key: "also_call_center", equals: "yes" }] }],
};

export const SEED_FIELDS: SeedField[] = [
  { id: "fld_legal", key: "legal_business_name", label: "Legal business name", help: "", type: "text", section: "identity", categories: ALL, required: true, sort: 10 },
  { id: "fld_dba", key: "dba", label: "DBA, if different", help: "", type: "text", section: "identity", categories: FOUR, sort: 20 },
  { id: "fld_contact", key: "contact_name", label: "Contact name", help: "", type: "text", section: "identity", categories: ALL, required: true, sort: 30 },
  { id: "fld_phone", key: "phone", label: "Phone", help: "", type: "tel", section: "identity", categories: ALL, required: true, sort: 40 },
  { id: "fld_address", key: "business_address", label: "Business street address", help: "", type: "text", section: "identity", categories: ALL, required: true, sort: 50 },
  { id: "fld_city", key: "city", label: "City", help: "", type: "text", section: "identity", categories: ALL, required: true, sort: 60 },
  { id: "fld_state", key: "state", label: "State", help: "", type: "text", section: "identity", categories: ALL, required: true, sort: 70 },
  { id: "fld_zip", key: "zip", label: "ZIP", help: "", type: "text", section: "identity", categories: ALL, required: true, sort: 80 },
  { id: "fld_ein", key: "ein", label: "EIN or tax ID", help: "Underwriting asks for this on a processing application.", type: "text", section: "identity", categories: FOUR, required: true, sort: 90 },
  {
    id: "fld_how",
    key: "how_accepted",
    label: "How do you accept payments?",
    help: "Choose every method you use. You can change the suggestion.",
    type: "multiselect",
    section: "payments",
    categories: FOUR,
    required: true,
    sort: 100,
    options: [
      { value: "in_person", label: "In person (counter, terminal, or mobile reader)" },
      { value: "online", label: "Online (checkout, cart, or gateway)" },
      { value: "phone", label: "Over the phone (virtual terminal, invoice, QR, or payment link)" },
    ],
  },
  {
    id: "fld_cardach",
    key: "card_or_ach",
    label: "Cards, bank payments, or both?",
    help: "",
    type: "select",
    section: "payments",
    categories: FOUR,
    required: true,
    sort: 110,
    options: [
      { value: "card", label: "Cards" },
      { value: "ach", label: "Bank payments (ACH)" },
      { value: "both", label: "Cards and ACH" },
    ],
  },
  {
    id: "fld_phone_tools",
    key: "phone_tools",
    label: "Phone acceptance",
    help: "Virtual terminal, invoice, QR, and payment links.",
    type: "multiselect",
    section: "payments",
    categories: ["call-centers"],
    required: true,
    sort: 120,
    options: [
      { value: "virtual_terminal", label: "Virtual terminal" },
      { value: "e_invoice", label: "Invoice by email or text" },
      { value: "qr", label: "QR code" },
      { value: "payment_links", label: "Payment links" },
    ],
  },
  {
    id: "fld_gateway",
    key: "gateway_choice",
    label: "Gateway",
    help: "Authorize.Net and NMI are payment gateways. PaycoreOS is a reseller of both. A gateway is not the processor. We do not tell you which company receives the file.",
    type: "select",
    section: "gateway",
    categories: ["call-centers", "ecommerce"],
    required: true,
    sort: 130,
    options: [
      { value: "authorizenet", label: "Authorize.Net gateway" },
      { value: "nmi", label: "NMI gateway" },
      { value: "either", label: "Choose the gateway for me" },
    ],
  },
  {
    id: "fld_store",
    key: "store_setup",
    label: "What does the store use today?",
    help: "",
    type: "select",
    section: "payments",
    categories: ["ecommerce"],
    required: true,
    sort: 140,
    options: [
      { value: "checkout", label: "Checkout" },
      { value: "cart", label: "Shopping cart" },
      { value: "gateway", label: "Gateway" },
    ],
  },
  {
    id: "fld_cart",
    key: "cart_brand",
    label: "Shopping cart name",
    help: "Optional. For PaycoreOS, not sent as a processor field.",
    type: "text",
    section: "payments",
    categories: ["ecommerce"],
    sort: 145,
    screening: true,
  },
  {
    id: "fld_swipe",
    key: "swipe_band",
    label: "How much of your sales is in person?",
    help: "If most sales are not in person, underwriting looks at the website and may ask for a login.",
    type: "select",
    section: "website",
    categories: FOUR,
    required: true,
    sort: 150,
    options: [
      { value: "under_70", label: "Under 70% of sales are in person" },
      { value: "seventy_or_more", label: "70% or more of sales are in person" },
    ],
  },
  {
    id: "fld_web",
    key: "website_url",
    label: "Website",
    help: "Underwriting looks at the site.",
    type: "text",
    section: "website",
    categories: ["call-centers", "ecommerce", "dispute-defense"],
    required: true,
    sort: 160,
  },
  {
    id: "fld_web_opt",
    key: "website_url_store",
    label: "Website, if you have one",
    help: "",
    type: "text",
    section: "website",
    categories: ["retail", "restaurants"],
    sort: 161,
  },
  {
    id: "fld_web_user",
    key: "website_username",
    label: "Website or portal username",
    help: "Underwriting looks at the site. Required when most sales are not in person.",
    type: "text",
    section: "website",
    categories: FOUR,
    required: true,
    sort: 170,
    condition: { all: [{ key: "swipe_band", equals: "under_70" }] },
  },
  {
    id: "fld_web_pass",
    key: "website_password",
    label: "Website or portal password",
    help: "Used so underwriting can look at the site. Required when most sales are not in person.",
    type: "text",
    section: "website",
    categories: FOUR,
    required: true,
    sort: 180,
    condition: { all: [{ key: "swipe_band", equals: "under_70" }] },
  },
  {
    id: "fld_hardware",
    key: "hardware",
    label: "What do you want in person?",
    help: "Choose Clover only if you already have the terminal. PaycoreOS does not ship a new Clover unit.",
    type: "select",
    section: "hardware",
    categories: ["retail", "restaurants"],
    required: true,
    sort: 190,
    options: [
      { value: "counter", label: "Counter terminal" },
      { value: "handheld", label: "Handheld terminal" },
      { value: "tap_to_pay", label: "Tap to pay on a phone" },
      { value: "existing_clover", label: "Connect a Clover terminal we already have" },
    ],
  },
  {
    id: "fld_ebt",
    key: "accepts_ebt",
    label: "Do you accept EBT?",
    help: "",
    type: "radio",
    section: "hardware",
    categories: ["retail", "restaurants"],
    required: true,
    sort: 200,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "fld_fns",
    key: "fns_number",
    label: "FNS number",
    help: "Required only if you accept EBT.",
    type: "text",
    section: "hardware",
    categories: ["retail", "restaurants"],
    required: true,
    sort: 210,
    condition: { all: [{ key: "accepts_ebt", equals: "yes" }] },
  },
  {
    id: "fld_cards",
    key: "accepts_cards",
    label: "Do you already accept cards?",
    help: "This form is only for a business that already accepts cards. If the answer is no, apply in the category that matches how you will take payments.",
    type: "radio",
    section: "defense",
    categories: ["dispute-defense"],
    required: true,
    sort: 220,
    options: [
      { value: "yes", label: "Yes, we already accept cards" },
      { value: "no", label: "No, this would be our first card account" },
    ],
  },
  {
    id: "fld_their_proc",
    key: "merchant_processor",
    label: "Current processor",
    help: "The company that processes your cards today. This is your processor. We do not tell you which company we use.",
    type: "text",
    section: "defense",
    categories: ["dispute-defense"],
    required: true,
    sort: 230,
  },
  {
    id: "fld_descriptor",
    key: "descriptor",
    label: "Card descriptor",
    help: "The name your customers see on their card statement.",
    type: "text",
    section: "defense",
    categories: ["dispute-defense"],
    required: true,
    sort: 240,
  },
  {
    id: "fld_mid",
    key: "mid",
    label: "Merchant ID (MID)",
    help: "The merchant ID on your processing statement.",
    type: "text",
    section: "defense",
    categories: ["dispute-defense"],
    required: true,
    sort: 250,
  },
  {
    id: "fld_caid",
    key: "caid",
    label: "Card acceptor ID (CAID)",
    help: "The card acceptor ID on your processing statement.",
    type: "text",
    section: "defense",
    categories: ["dispute-defense"],
    required: true,
    sort: 260,
  },
  {
    id: "fld_tools",
    key: "defense_tools",
    label: "Which Visa and Mastercard tools do you want?",
    help: "Choose at least one. There is no monthly price on this form.",
    type: "multiselect",
    section: "defense",
    categories: ["dispute-defense"],
    required: true,
    sort: 270,
    options: [
      { value: "order_insight", label: "Visa Order Insight" },
      { value: "rdr", label: "Rapid Dispute Resolution" },
      { value: "cdrn", label: "Cardholder Dispute Resolution Network" },
      { value: "resolve", label: "Resolve" },
      { value: "ce30", label: "Compelling Evidence 3.0" },
      { value: "ethoca_alerts", label: "Mastercard Ethoca Alerts" },
      { value: "consumer_clarity", label: "Ethoca Consumer Clarity" },
    ],
  },
  {
    id: "fld_also_cc",
    key: "also_call_center",
    label: "This business is also a call center",
    help: "If you check this, agreements, scripts, and articles of incorporation or organization are required.",
    type: "checkbox",
    section: "defense",
    categories: ["dispute-defense"],
    sort: 280,
  },
  { id: "fld_id", key: "government_id", label: "Government photo ID", help: "A photo of the owner's government ID. Do not type the ID number.", type: "file", section: "documents", categories: FOUR, required: true, sort: 300 },
  { id: "fld_check", key: "voided_check", label: "Voided check or bank letter", help: "", type: "file", section: "documents", categories: FOUR, required: true, sort: 310 },
  { id: "fld_bank", key: "bank_statements", label: "Three months of business bank statements", help: "One file or several.", type: "file", section: "documents", categories: FOUR, required: true, multiple: true, sort: 320 },
  { id: "fld_formation", key: "formation_documents", label: "Business formation documents", help: "Articles, a certificate of formation, or the equivalent you already have.", type: "file", section: "documents", categories: FOUR, required: true, sort: 330 },
  {
    id: "fld_proc_stmt",
    key: "processing_statements",
    label: "Three months of processing statements",
    help: "Required because you already accept cards.",
    type: "file",
    section: "documents",
    categories: FOUR,
    buyerTypes: ["existing"],
    required: true,
    multiple: true,
    sort: 340,
  },
  {
    id: "fld_agreements",
    key: "agreements",
    label: "Agreements",
    help: "The customer agreements the call center uses. Required for a call center, and for dispute defense only if the business is also a call center.",
    type: "file",
    section: "documents",
    categories: ["call-centers", "dispute-defense"],
    required: true,
    sort: 350,
    condition: CALL_DOCS,
  },
  {
    id: "fld_scripts",
    key: "scripts",
    label: "Scripts",
    help: "The scripts agents read to customers.",
    type: "file",
    section: "documents",
    categories: ["call-centers", "dispute-defense"],
    required: true,
    sort: 360,
    condition: CALL_DOCS,
  },
  {
    id: "fld_articles",
    key: "articles",
    label: "Articles of incorporation or organization",
    help: "",
    type: "file",
    section: "documents",
    categories: ["call-centers", "dispute-defense"],
    required: true,
    sort: 370,
    condition: CALL_DOCS,
  },
  {
    id: "fld_def_stmt",
    key: "defense_statements",
    label: "Processing statements",
    help: "Optional. Send them if you have them. The form does not wait on this file.",
    type: "file",
    section: "documents",
    categories: ["dispute-defense"],
    multiple: true,
    sort: 380,
  },
  {
    id: "fld_cb_reports",
    key: "chargeback_reports",
    label: "Chargeback reports",
    help: "Optional. Send them if you have them.",
    type: "file",
    section: "documents",
    categories: ["dispute-defense"],
    multiple: true,
    sort: 390,
  },
  {
    id: "fld_story",
    key: "screening_story",
    label: "How you accept cards today",
    help: "For PaycoreOS, not sent as a processor field.",
    type: "textarea",
    section: "screening",
    categories: FOUR,
    sort: 400,
    screening: true,
  },
  {
    id: "fld_cb_notes",
    key: "screening_chargebacks",
    label: "Chargebacks you want us to know about",
    help: "For PaycoreOS, not sent as a processor field.",
    type: "textarea",
    section: "screening",
    categories: ALL,
    sort: 410,
    screening: true,
  },
  {
    id: "fld_notes",
    key: "screening_notes",
    label: "Notes for PaycoreOS",
    help: "For PaycoreOS, not sent as a processor field.",
    type: "textarea",
    section: "screening",
    categories: ALL,
    sort: 420,
    screening: true,
  },
];

export function rowToField(row: Record<string, unknown>): FieldDef {
  return {
    id: String(row.id),
    key: String(row.key),
    label: String(row.label),
    help_text: String(row.help_text ?? ""),
    field_type: String(row.field_type) as FieldType,
    section: String(row.section),
    categories: parseJson<string[]>(row.categories, []),
    buyer_types: row.buyer_types ? parseJson<string[]>(row.buyer_types, []) : null,
    required: Number(row.required) ? 1 : 0,
    multiple: Number(row.multiple) ? 1 : 0,
    options: row.options_json ? parseJson<Option[]>(row.options_json, []) : null,
    condition: row.condition_json ? parseJson<Condition | null>(row.condition_json, null) : null,
    sort_order: Number(row.sort_order) || 0,
    active: Number(row.active) ? 1 : 0,
    screening: Number(row.screening) ? 1 : 0,
  };
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function fieldVisible(field: FieldDef, category: string, buyerType: string | null, answers: Answers): boolean {
  if (!field.active) return false;
  if (!field.categories.includes(category)) return false;
  if (field.buyer_types && field.buyer_types.length > 0) {
    if (!buyerType || !field.buyer_types.includes(buyerType)) return false;
  }
  if (!field.condition) return true;
  return matchCond(field.condition, category, buyerType, answers);
}

function matchCond(cond: Condition, category: string, buyerType: string | null, answers: Answers): boolean {
  if ("any" in cond && Array.isArray(cond.any)) {
    return cond.any.some((part) => matchCond(part, category, buyerType, answers));
  }
  const branch = cond as { all?: CondRule[]; categories?: string[]; buyer_types?: string[] };
  if (branch.categories && !branch.categories.includes(category)) return false;
  if (branch.buyer_types && (!buyerType || !branch.buyer_types.includes(buyerType))) return false;
  if (branch.all) {
    for (const rule of branch.all) {
      if (answerString(answers[rule.key]) !== rule.equals) return false;
    }
  }
  return true;
}

export function answerString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(",");
  return value ?? "";
}

export function defaultAnswers(category: string): Answers {
  const answers: Answers = {};
  if (category === "call-centers") answers.how_accepted = ["phone"];
  if (category === "ecommerce") answers.how_accepted = ["online"];
  if (category === "retail" || category === "restaurants") answers.how_accepted = ["in_person"];
  if (category === "call-centers" || category === "ecommerce") answers.swipe_band = "under_70";
  if (category === "retail" || category === "restaurants") answers.swipe_band = "seventy_or_more";
  if (category === "restaurants") answers.hardware = "handheld";
  if (category === "retail") answers.hardware = "counter";
  answers.card_or_ach = "card";
  answers.accepts_ebt = "no";
  return answers;
}

export const SECTION_LABELS: Record<string, string> = {
  identity: "Business identity",
  payments: "How you take payments",
  gateway: "Gateway",
  website: "Website",
  hardware: "In person",
  defense: "Dispute defense",
  documents: "Documents",
  screening: "For PaycoreOS, not sent as a processor field",
};

export const ALLOWED_FILE = new Set(["pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "txt", "csv"]);
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
