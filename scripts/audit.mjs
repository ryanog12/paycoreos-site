const base = process.env.BASE || "http://127.0.0.1:8787";
const banned = /maverick|kurv|nexio|nuvei|disputifier/i;
const failures = [];
function fail(msg) { failures.push(msg); console.error("FAIL", msg); }
function ok(msg) { console.log("OK", msg); }

const pages = ["/", "/call-centers", "/ecommerce", "/retail", "/restaurants", "/switching", "/startups", "/dispute-defense", "/services", "/apply", "/about", "/contact", "/privacy", "/terms", "/application-fee"];
const html = {};
for (const path of pages) {
  const res = await fetch(base + path);
  const text = await res.text();
  html[path] = text;
  if (res.status !== 200) fail(`${path} status ${res.status}`);
  const h1s = text.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1) fail(`${path} has ${h1s.length} h1 tags`);
  for (const tag of ["<title>", 'name="description"', 'rel="canonical"', 'property="og:title"', 'property="og:description"', 'property="og:url"']) {
    if (!text.includes(tag)) fail(`${path} missing ${tag}`);
  }
  if (!text.includes("PaycoreOS, a DBA of Telecom Elite, Inc., 1809 E Broadway St, Oviedo, FL 32765, (407) 270-2502, info@paycoreos.com.")) {
    fail(`${path} missing footer identity`);
  }
  if (banned.test(text)) fail(`${path} names a supplier`);
  if (/stripe|js\.stripe|pk_live|pk_test/i.test(text)) fail(`${path} mentions Stripe`);
  if (path !== "/about" && text.includes("98%")) fail(`${path} has 98%`);
  if (path !== "/apply" && path !== "/about" && /\d+(\.\d+)?%/.test(text.replace(/98%/g, ""))) fail(`${path} has a percent`);
}
if (!html["/about"].includes("98% boarding success across hundreds of applications since 2013")) fail("about missing 98% basis");
for (const path of ["/", "/services", "/ecommerce", "/call-centers"]) {
  if (!html[path].includes("Authorize.Net") || !html[path].includes("NMI")) fail(`${path} missing gateways`);
  if (!/gateway/i.test(html[path])) fail(`${path} missing gateway`);
}
if (/Authorize\.Net processor|NMI processor/i.test(Object.values(html).join("\n"))) fail("gateway called a processor");
if (/high-risk|offshore|nutra|quantic|0\.38|94%/i.test(Object.values(html).join("\n"))) fail("old marketing claim is still on a public page");
const ld = html["/"].match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!ld) fail("json-ld script missing");
else {
  const data = JSON.parse(ld[1]);
  if (data["@type"] !== "ProfessionalService") fail("json-ld type");
  if (!data.telephone || !data.email || !data.address) fail("json-ld contact");
  const names = JSON.stringify(data);
  if (banned.test(names)) fail("json-ld names a supplier");
  if (!names.includes("Authorize.Net gateway") || !names.includes("NMI gateway") || !names.includes("Dispute defense")) fail("json-ld services");
}
for (const path of pages) {
  const canon = path === "/" ? "https://paycoreos.com/" : `https://paycoreos.com${path}`;
  if (!html[path].includes(`rel="canonical" href="${canon}"`)) fail(`${path} canonical`);
}
if (!html["/"].includes("application/ld+json")) fail("home missing json-ld");
if (/aggregateRating|reviewCount|ratingValue/i.test(html["/"])) fail("home has a rating");
if (!html["/dispute-defense"].includes("MID") || !html["/dispute-defense"].includes("CAID")) fail("defense page missing MID/CAID");
if (html["/dispute-defense"].includes("Start a processing application")) fail("upsell is on the defense page");
if (!html["/switching"].includes("Already processing? Bring your statement.")) fail("switching h1");
if (!html["/call-centers"].includes("Card-not-present processing for call centers")) fail("call center h1");
const thanks = await fetch(base + "/thank-you");
const thanksHtml = await thanks.text();
if (thanks.status !== 404) fail(`thank-you status ${thanks.status}`);
if (!thanksHtml.includes("noindex")) fail("thank-you missing noindex");
if (banned.test(thanksHtml)) fail("thank-you names a supplier");

const robots = await (await fetch(base + "/robots.txt")).text();
for (const agent of ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot"]) {
  if (!robots.includes(`User-agent: ${agent}`)) fail(`robots missing ${agent}`);
}
for (const path of ["/thank-you", "/admin", "/portal"]) {
  if (!robots.includes(`Disallow: ${path}`)) fail(`robots missing disallow ${path}`);
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
for (const path of pages) {
  const loc = path === "/" ? "https://paycoreos.com/" : `https://paycoreos.com${path}`;
  if (!sitemap.includes(`<loc>${loc}</loc>`)) fail(`sitemap missing ${loc}`);
}
if (/thank-you|\/admin|\/portal/.test(sitemap)) fail("sitemap lists a private url");
const llms = await (await fetch(base + "/llms.txt")).text();
if (banned.test(llms)) fail("llms names a supplier");
if (!llms.includes("info@paycoreos.com") || !llms.includes("1809 E Broadway St")) fail("llms missing contact");
if (/\d+(\.\d+)?%/.test(llms)) fail("llms has a percent");

const tracked = await fetch(base + "/restaurants?gclid=g-1&utm_source=google&fbclid=f-1&li_fat_id=l-1");
const cookie = (tracked.headers.getSetCookie?.() || []).join(";");
if (!cookie.includes("paycore_attr") || !cookie.includes("g-1")) fail("click id cookie missing");

const form = new FormData();
form.set("category", "dispute-defense");
form.set("email", "merchant-audit@example.com");
form.set("password", "portal-password-1");
form.set("password_confirm", "portal-password-1");
form.set("agree", "yes");
form.set("gclid", "g-1");
form.set("utm_source", "google");
form.set("fbclid", "f-1");
form.set("li_fat_id", "l-1");
const fields = {
  legal_business_name: "Audit Cafe LLC",
  contact_name: "Ada Audit",
  phone: "407-555-0100",
  business_address: "1 Main St",
  city: "Oviedo",
  state: "FL",
  zip: "32765",
  accepts_cards: "yes",
  merchant_processor: "Square",
  descriptor: "AUDIT CAFE",
  mid: "MID123456",
  caid: "CAID987",
  website_url: "https://audit.example",
};
for (const [key, value] of Object.entries(fields)) form.set("f_" + key, value);
form.append("f_defense_tools", "order_insight");
form.append("f_defense_tools", "ethoca_alerts");
const submitted = await fetch(base + "/apply", { method: "POST", body: form, redirect: "manual" });
if (submitted.status !== 303) {
  const err = await submitted.text();
  fail(`defense submit status ${submitted.status} ${err.slice(0, 500)}`);
} else {
  const loc = submitted.headers.get("location");
  const session = (submitted.headers.getSetCookie?.() || []).find((c) => c.startsWith("paycore_session="));
  if (!session) fail("no session cookie");
  if (!loc?.startsWith("/apply/fee")) fail(`fee redirect ${loc}`);
  const fee = await fetch(base + loc, { headers: { cookie: session.split(";")[0] } });
  const feeHtml = await fee.text();
  if (fee.status !== 200) fail(`fee page ${fee.status}`);
  if (!feeHtml.includes("disabled") || !/Pay \$39/.test(feeHtml)) fail("pay button missing");
  if (feeHtml.includes("fee_paid")) fail("fee page contains fee_paid");
  if (!feeHtml.includes("application_submitted")) fail("submitted event missing");
  if (banned.test(feeHtml)) fail("fee page names a supplier");
  const portal = await fetch(base + "/portal", { headers: { cookie: session.split(";")[0] } });
  const portalHtml = await portal.text();
  if (portal.status !== 200) fail(`portal ${portal.status}`);
  if (banned.test(portalHtml)) fail("portal names a supplier");
  const ref = loc.split("ref=")[1];
  const appPage = await fetch(base + "/portal/app/" + ref, { headers: { cookie: session.split(";")[0] } });
  const appHtml = await appPage.text();
  if (!appHtml.includes("Start a processing application")) fail("portal missing defense upsell");
  if (!appHtml.includes("Square") || !appHtml.includes("MID123456")) fail("portal missing merchant answers");
  if (banned.test(appHtml)) fail("application page names a supplier");
  ok("defense application " + ref);

  const adminForm = new FormData();
  adminForm.set("email", "admin@paycoreos.com");
  adminForm.set("password", process.env.ADMIN_PASSWORD || "");
  const adminLogin = await fetch(base + "/admin/login", { method: "POST", body: adminForm, redirect: "manual" });
  const adminCookie = (adminLogin.headers.getSetCookie?.() || []).find((c) => c.startsWith("paycore_session="));
  if (!adminCookie || adminLogin.status !== 303) fail(`admin login ${adminLogin.status}`);
  else {
    const cookieHeader = adminCookie.split(";")[0];
    const detail = await fetch(base + "/admin/applications/" + ref, { headers: { cookie: cookieHeader } });
    const detailHtml = await detail.text();
    if (!detailHtml.includes("Disputifier")) fail("admin cannot see Disputifier");
    const id = detailHtml.match(/name="processor_id"[\s\S]*?<option value="(proc_disputifier)"/)?.[1]
      || detailHtml.match(/value="(proc_disputifier)"/)?.[1];
    if (!id) fail("disputifier option missing");
    const push = new FormData();
    push.set("processor_id", id);
    push.set("push_target", "manual-defense-1");
    push.set("mark_submitted", "yes");
    const pushed = await fetch(base + "/admin/applications/" + ref + "/push", { method: "POST", body: push, headers: { cookie: cookieHeader }, redirect: "manual" });
    if (pushed.status < 300 || pushed.status > 399) fail(`push ${pushed.status}`);
    const note = new FormData();
    note.set("body", "Internal only: file is with Disputifier.");
    await fetch(base + "/admin/applications/" + ref + "/note", { method: "POST", body: note, headers: { cookie: cookieHeader }, redirect: "manual" });
    const update = new FormData();
    update.set("body", "We have the file and will write if we need a document.");
    await fetch(base + "/admin/applications/" + ref + "/update", { method: "POST", body: update, headers: { cookie: cookieHeader }, redirect: "manual" });
    const after = await fetch(base + "/portal/app/" + ref, { headers: { cookie: session.split(";")[0] } });
    const afterHtml = await after.text();
    if (banned.test(afterHtml)) fail("merchant saw a supplier after admin push");
    if (!afterHtml.includes("We have the file and will write if we need a document.")) fail("merchant missed the visible update");
    if (!afterHtml.includes("Submitted")) fail("submitted status missing on the portal");
    const field = new FormData();
    field.set("key", "audit_note");
    field.set("label", "Extra retail note");
    field.set("help_text", "Added in admin without a code change.");
    field.set("field_type", "text");
    field.set("section", "screening");
    field.set("categories", "retail");
    field.set("sort_order", "500");
    field.set("active", "yes");
    const added = await fetch(base + "/admin/fields", { method: "POST", body: field, headers: { cookie: cookieHeader }, redirect: "manual" });
    if (added.status < 300 || added.status > 399) fail(`add field ${added.status}`);
    const retail = await (await fetch(base + "/apply?vertical=retail&buyer=first")).text();
    if (!retail.includes("Extra retail note")) fail("new field did not show on the apply form");
    const fieldList = await (await fetch(base + "/admin/fields", { headers: { cookie: cookieHeader } })).text();
    const fieldId = fieldList.match(/href="\/admin\/fields\/(fld_[^"]+)"[^>]*>Extra retail note/)?.[1];
    if (!fieldId) fail("new field missing in admin");
    else await fetch(base + "/admin/fields/" + fieldId + "/delete", { method: "POST", headers: { cookie: cookieHeader } });
    if (afterHtml.includes("Internal only")) fail("internal note leaked");
    if (afterHtml.includes("manual-defense-1")) fail("push target leaked");
    const outbox = await fetch(base + "/admin/outbox", { headers: { cookie: cookieHeader } });
    const outHtml = await outbox.text();
    if (!outHtml.includes("queued") || !outHtml.includes("info@paycoreos.com")) fail("outbox missing queued mail");
    if (!outHtml.includes("Nothing is delivered") && !outHtml.includes("not being sent") && !outHtml.includes("Real email stays off")) {
      fail("outbox does not say delivery is off");
    }
    ok("admin push stayed off the portal");
  }
}

const missing = new FormData();
missing.set("category", "call-centers");
missing.set("buyer", "existing");
missing.set("email", "callcenter-audit@example.com");
missing.set("password", "portal-password-1");
missing.set("password_confirm", "portal-password-1");
missing.set("agree", "yes");
missing.set("f_legal_business_name", "Call Co");
missing.set("f_contact_name", "Cam Caller");
missing.set("f_phone", "407-555-0199");
missing.set("f_business_address", "2 Main");
missing.set("f_city", "Oviedo");
missing.set("f_state", "FL");
missing.set("f_zip", "32765");
missing.set("f_ein", "12-3456789");
missing.append("f_how_accepted", "phone");
missing.set("f_card_or_ach", "card");
missing.append("f_phone_tools", "virtual_terminal");
missing.set("f_gateway_choice", "authorizenet");
missing.set("f_swipe_band", "under_70");
missing.set("f_website_url", "https://call.example");
missing.set("f_website_username", "owner");
missing.set("f_website_password", "site-pass");
const denied = await fetch(base + "/apply", { method: "POST", body: missing });
const deniedHtml = await denied.text();
if (denied.status !== 400) fail(`call center without files status ${denied.status}`);
if (!deniedHtml.includes("Agreements") || !deniedHtml.includes("Scripts") || !deniedHtml.includes("Articles")) fail("call center did not require the three files");
if (banned.test(deniedHtml)) fail("call center form names a supplier");
if (!deniedHtml.includes("Authorize.Net gateway")) fail("call center form missing Authorize.Net");

const contact = new FormData();
contact.set("name", "Pat Contact");
contact.set("email", "pat@example.com");
contact.set("phone", "407-555-0133");
contact.set("message", "Please call me about retail.");
const sent = await fetch(base + "/contact", { method: "POST", body: contact, redirect: "manual" });
if (sent.status < 300 || sent.status > 399) fail(`contact ${sent.status}`);
const received = await (await fetch(base + "/contact?received=1")).text();
if (!received.includes("We saved your message")) fail("contact confirmation missing");

if (failures.length) {
  console.error(`\n${failures.length} failures`);
  process.exit(1);
}
console.log("\nAll checks passed");
