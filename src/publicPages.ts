import { withQuery } from "./attr";
import { pageSeo, type PageSeo } from "./seo";
import { ADDRESS, categoryLabel, EMAIL, esc, feeBox, PHONE_DISPLAY, PHONE_TEL } from "./util";

function hero(opts: { eyebrow: string; h1: string; lede: string; support: string; primary: string; primaryHref: string; secondaryHref?: string; secondary?: string }): string {
  const second = opts.secondary && opts.secondaryHref ? `<a class="btn-s" href="${esc(opts.secondaryHref)}">${esc(opts.secondary)}</a>` : "";
  return `<header class="hero">
    <p class="eyebrow">${opts.eyebrow}</p>
    <h1>${opts.h1}</h1>
    <p class="lede">${opts.lede}</p>
    ${feeBox()}
    <div class="hero-actions">
      <a class="btn-p" href="${esc(opts.primaryHref)}">${esc(opts.primary)}</a>
      ${second}
    </div>
    <p class="support">${opts.support}</p>
  </header>`;
}

const TOOLS = `<ul class="plain">
  <li>Visa Order Insight</li>
  <li>Rapid Dispute Resolution</li>
  <li>Cardholder Dispute Resolution Network</li>
  <li>Resolve</li>
  <li>Compelling Evidence 3.0</li>
  <li>Mastercard Ethoca Alerts</li>
  <li>Ethoca Consumer Clarity</li>
</ul>`;

export function marketingMain(path: string, url: URL, contactReceived: boolean): string | null {
  const apply = (href: string) => withQuery(href, url);
  switch (path) {
    case "/":
      return homePage(apply);
    case "/call-centers":
      return `${hero({
        eyebrow: "PaycoreOS · a DBA of Telecom Elite, Inc. · Since 2013",
        h1: "Card-not-present processing for call centers",
        lede: "Phone payments, a virtual terminal, invoicing, and Visa and Mastercard dispute defense on one application. The form asks for the agreements, the scripts, and the articles of incorporation or organization.",
        support: "Most underwriting decisions within 24–72 business hours. The $39 fee is for review and submission. It is not collected until the fee account is ready.",
        primary: "Apply",
        primaryHref: apply("/apply?vertical=call-centers"),
        secondary: "Services",
        secondaryHref: "/services",
      })}
      <section class="wrap">
        <h2>What this application is for</h2>
        <p>Owners who take payment by phone. The form loads phone acceptance: virtual terminal, invoice, QR, and payment links. Online checkout can be added if you also invoice or run a cart.</p>
        <h2>Gateways</h2>
        <p>PaycoreOS offers the Authorize.Net gateway and the NMI gateway. PaycoreOS is a reseller of both. They are gateways. They are not processors, and choosing one does not tell you which company receives the application.</p>
        <h2>Dispute tools</h2>
        ${TOOLS}
        <h2>Files a call center must upload</h2>
        <ul class="plain">
          <li>Agreements: the customer agreements the call center uses.</li>
          <li>Scripts: the scripts agents read.</li>
          <li>Articles of incorporation or organization.</li>
        </ul>
        <p>The form does not submit without all three. You do not pick a processor for the script. We choose where the file goes, and we do not tell you which company that is.</p>
      </section>`;
    case "/ecommerce":
      return `${hero({
        eyebrow: "PaycoreOS · a DBA of Telecom Elite, Inc. · Since 2013",
        h1: "Gateway, checkout, and chargeback defense for online stores",
        lede: "A gateway or hosted checkout, recurring billing if you bill again, and Visa and Mastercard dispute tools so an unrecognized order does not have to become a chargeback.",
        support: "Most underwriting decisions within 24–72 business hours. The $39 fee is for review and submission. It is not collected until the fee account is ready.",
        primary: "Apply",
        primaryHref: apply("/apply?vertical=ecommerce"),
        secondary: "Services",
        secondaryHref: "/services",
      })}
      <section class="wrap">
        <h2>Gateways</h2>
        <p>PaycoreOS offers the Authorize.Net gateway and the NMI gateway for online stores and call centers. PaycoreOS is a reseller of both. A gateway is how the payment is sent. It is not the processor, and it is not the company that decides the application.</p>
        <h2>Also on this form</h2>
        <p>Checkout, shopping cart, or gateway. A virtual terminal. Invoices. Recurring billing. Your website. If most sales are not in person, underwriting looks at the site and the form asks for a login. That login is for the review.</p>
        <h2>Dispute tools</h2>
        ${TOOLS}
      </section>`;
    case "/retail":
      return `${hero({
        eyebrow: "PaycoreOS · a DBA of Telecom Elite, Inc. · Since 2013",
        h1: "In-person processing and POS for retail",
        lede: "A counter terminal, a handheld, or tap to pay on a phone. If you already have a Clover terminal, the application can say so. PaycoreOS does not ship a new Clover unit.",
        support: "Most underwriting decisions within 24–72 business hours. The $39 fee is for review and submission. It is not collected until the fee account is ready.",
        primary: "Apply",
        primaryHref: apply("/apply?vertical=retail"),
        secondary: "Services",
        secondaryHref: "/services",
      })}
      <section class="wrap">
        <h2>What you can ask for</h2>
        <p>In-person cards, and online or phone if you also sell that way. Bank payments (ACH) if you want them. EBT, and an FNS number if you accept EBT. The portal shows the choice you made, such as handheld or counter. It does not name a supplier.</p>
      </section>`;
    case "/restaurants":
      return `${hero({
        eyebrow: "PaycoreOS · a DBA of Telecom Elite, Inc. · Since 2013",
        h1: "Restaurant processing and handheld checkout",
        lede: "Handheld checkout at the table, or a counter terminal. The same application as every other business. Tell us how you take payments.",
        support: "Most underwriting decisions within 24–72 business hours. The $39 fee is for review and submission. It is not collected until the fee account is ready.",
        primary: "Apply",
        primaryHref: apply("/apply?vertical=restaurants"),
        secondary: "Services",
        secondaryHref: "/services",
      })}
      <section class="wrap">
        <h2>What this page offers</h2>
        <p>Restaurant processing and a handheld, a counter terminal, or tap to pay. A Clover terminal you already own can be connected. PaycoreOS does not ship a new Clover unit. If you accept EBT, the form asks for the FNS number.</p>
      </section>`;
    case "/switching":
      return `${hero({
        eyebrow: "PaycoreOS · a DBA of Telecom Elite, Inc. · Since 2013",
        h1: "Already processing? Bring your statement.",
        lede: "Call centers, online stores, retailers, and restaurants. We review the statement with the application. This page does not quote a processing rate.",
        support: "The $39 application fee is on this page and again on the form. It is not a processing rate. It is not collected until the fee account is ready.",
        primary: "Apply",
        primaryHref: apply("/apply?buyer=existing"),
        secondary: "Services",
        secondaryHref: "/services",
      })}
      <section class="wrap">
        <h2>Choose the business</h2>
        <div class="card-grid">
          ${["call-centers", "ecommerce", "retail", "restaurants"]
            .map((value) => {
              const label = categoryLabel(value);
              return `<a class="card" href="${esc(apply(`/apply?vertical=${value}&buyer=existing`))}"><h3>${label}</h3><p>I already accept cards.</p></a>`;
            })
            .join("")}
        </div>
      </section>`;
    case "/declined":
      return `${hero({
        eyebrow: "PaycoreOS · a DBA of Telecom Elite, Inc. · Since 2013",
        h1: "Declined by a big bank?",
        lede: "PaycoreOS still submits the application. Most underwriting decisions within 24–72 business hours. That is not a promise of approval.",
        support: "Choose the business below. The application then asks whether a bank declined you, which bank, and for an optional copy of the notice.",
        primary: "Choose a business",
        primaryHref: "#business",
      })}
      <section class="wrap" id="business">
        <h2>Choose the business</h2>
        <p>The application is still for a call center, an online store, retail, a restaurant, or dispute defense.</p>
        <div class="card-grid">
          <a class="card" href="${esc(apply("/apply?vertical=call-centers&declined=1"))}"><h3>Call center</h3><p>Card-not-present processing.</p></a>
          <a class="card" href="${esc(apply("/apply?vertical=ecommerce&declined=1"))}"><h3>Online store</h3><p>Gateway and checkout.</p></a>
          <a class="card" href="${esc(apply("/apply?vertical=retail&declined=1"))}"><h3>Retail</h3><p>In-person processing and POS.</p></a>
          <a class="card" href="${esc(apply("/apply?vertical=restaurants&declined=1"))}"><h3>Restaurant</h3><p>Restaurant processing and handheld checkout.</p></a>
          <a class="card" href="${esc(apply("/apply?category=dispute-defense&declined=1"))}"><h3>Dispute defense</h3><p>For a business that already accepts cards. This does not open a processing account.</p></a>
        </div>
      </section>`;
    case "/startups":
      return `${hero({
        eyebrow: "PaycoreOS · a DBA of Telecom Elite, Inc. · Since 2013",
        h1: "First merchant account for a new business",
        lede: "Call centers, online stores, retailers, and restaurants. A legal business, a business bank account, and an owner ID are required. The fee is not an approval.",
        support: "Most underwriting decisions within 24–72 business hours. The $39 fee is for review and submission. It is not collected until the fee account is ready.",
        primary: "Apply",
        primaryHref: apply("/apply?buyer=first"),
        secondary: "Services",
        secondaryHref: "/services",
      })}
      <section class="wrap">
        <h2>Before you start</h2>
        <ul class="plain">
          <li>A legal entity.</li>
          <li>A business bank account.</li>
          <li>An owner ID.</li>
        </ul>
        <p>You do not need processing statements if you have never accepted cards. Bank statements, formation papers, a photo ID, and a voided check or bank letter are on the form.</p>
        <div class="card-grid">
          ${["call-centers", "ecommerce", "retail", "restaurants"]
            .map((value) => `<a class="card" href="${esc(apply(`/apply?vertical=${value}&buyer=first`))}"><h3>${categoryLabel(value)}</h3><p>This is my first merchant account.</p></a>`)
            .join("")}
        </div>
      </section>`;
    case "/dispute-defense":
      return `${hero({
        eyebrow: "PaycoreOS · a DBA of Telecom Elite, Inc. · Since 2013",
        h1: "Dispute defense for businesses that already accept cards",
        lede: "Visa and Mastercard dispute tools for the processor you already have. This application does not open a new processing account. We do not tell you which company we use to enroll the tools.",
        support: "The $39 fee is for review and submission. It is not a monthly defense price, and it is not collected until the fee account is ready.",
        primary: "Apply",
        primaryHref: apply("/apply?category=dispute-defense"),
        secondary: "Services",
        secondaryHref: "/services",
      })}
      <section class="wrap">
        <h2>What the form asks</h2>
        <ul class="plain">
          <li>Legal business name, contact, phone, email, and business address.</li>
          <li>Confirmation that you already accept cards.</li>
          <li>Your current processor and the descriptor customers see.</li>
          <li>Your merchant ID (MID) and card acceptor ID (CAID).</li>
          <li>Your website.</li>
          <li>Which tools you want.</li>
          <li>Processing statements or chargeback reports, if you have them. Those files are optional.</li>
        </ul>
        <h2>Tools</h2>
        ${TOOLS}
        <p>If the business is also a call center, the form requires agreements, scripts, and articles of incorporation or organization. A processing application is not on this form. After you enroll, the merchant portal can offer one. You do not have to take it.</p>
      </section>`;
    case "/services":
      return `<header class="hero">
        <p class="eyebrow">PaycoreOS · a DBA of Telecom Elite, Inc.</p>
        <h1>Merchant processing, gateways, point of sale, and dispute defense</h1>
        <p class="lede">Capabilities only. We match the account, the gateway or terminal, and dispute defense to the way you take payments. We do not publish a processing rate.</p>
        <div class="hero-actions"><a class="btn-p" href="${esc(apply("/apply"))}">Apply</a></div>
      </header>
      <section class="wrap">
        <h2>Take the payment</h2>
        <p>Card payments in person, online, and by phone. Bank payments (ACH). A virtual terminal. A payment gateway and hosted checkout. Payment links.</p>
        <h2>Authorize.Net gateway and NMI gateway</h2>
        <p>PaycoreOS offers both gateways and is a reseller of both. They are for call centers and online stores, where a gateway is the product. A gateway is not a processor. Choosing Authorize.Net or NMI does not name the company that receives your application. We do not tell you which company that is.</p>
        <h2>Bill again</h2>
        <p>Invoices by email or text. Recurring and subscription billing. Card on file.</p>
        <h2>In person</h2>
        <p>Counter terminal, handheld terminal, and tap to pay on a phone. A Clover terminal the business already owns can be connected. PaycoreOS does not ship a new Clover unit.</p>
        <h2>Dispute defense</h2>
        <p>Dispute defense is its own service for a business that already accepts cards. It is not a substitute for a processing application, and it does not open one.</p>
        ${TOOLS}
        <p><a href="${esc(apply("/dispute-defense"))}">Dispute defense for businesses that already accept cards</a></p>
        <h2>Pricing programs</h2>
        <p>Surcharging and dual pricing are programs a business can ask about. No percent is quoted here.</p>
        ${feeBox()}
      </section>`;
    case "/about":
      return `<article class="wrap prose">
        <p class="eyebrow">PaycoreOS · Telecom Elite, Inc.</p>
        <h1>About PaycoreOS</h1>
        <p>PaycoreOS is a DBA of Telecom Elite, Inc. The company has been at this since 2013. The work is the same shape it has always been: get the account approved, then defend it so the account stays open.</p>
        <p><strong>98% boarding success across hundreds of applications since 2013.</strong> That figure counts boarding outcomes on applications PaycoreOS handled in that period. It is not a promise that the next application is approved.</p>
        <p>Most files get an underwriting answer within 24 to 72 business hours. That is the usual pace. It is not a promise that yours will, and it is not a promise that the answer will be yes.</p>
        <p>For phone payments and online checkout, PaycoreOS resells the Authorize.Net gateway and the NMI gateway. Those are gateways, not the company that underwrites the account.</p>
        <p>There is no one-size-fits-all account. The form asks how you take payments. A person submits the file. The merchant portal never names the company that received it.</p>
        <h2>Office</h2>
        <p>PaycoreOS, a DBA of Telecom Elite, Inc.<br>${ADDRESS}<br><a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a><br><a href="mailto:${EMAIL}">${EMAIL}</a></p>
        <p><a class="btn-p" href="${esc(apply("/apply"))}">Apply</a></p>
      </article>`;
    case "/contact":
      return `<article class="wrap">
        <header class="page-head"><h1>Contact PaycoreOS</h1>
        <p class="lede">Call, email, or send a note. The inbox at ${EMAIL} is the address to use. If email is quiet, call.</p></header>
        <div class="split">
          <div>
            <p><span class="k">Phone</span><br><a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></p>
            <p><span class="k">Email</span><br><a href="mailto:${EMAIL}">${EMAIL}</a></p>
            <p><span class="k">Address</span><br>PaycoreOS, a DBA of Telecom Elite, Inc.<br>${ADDRESS}</p>
          </div>
          <form class="stack-form" method="post" action="/contact">
            ${contactReceived ? '<p class="ok" role="status">We saved your message. Email from this site is not being sent yet. If you need an answer now, call (407) 270-2502.</p>' : ""}
            <label>Name<input name="name" required autocomplete="name"></label>
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
            <label>Message<textarea name="message" required></textarea></label>
            <button class="btn-p" type="submit">Send message</button>
          </form>
        </div>
      </article>`;
    case "/application-fee":
      return `<article class="wrap prose">
        <h1>The $39 application fee</h1>
        <p>The fee is $39. It is the same for call centers, online stores, retail, restaurants, businesses that already process, new businesses, and dispute defense.</p>
        ${feeBox()}
        <h2>When it is charged</h2>
        <p>After the form is complete, and only after you have seen the fee language. Not before the form. The pay button on the application is off. If you do not see a way to pay, we are not charging you. The fee is not collected until the fee account is ready.</p>
        <h2>When it is not refunded</h2>
        <ul>
          <li>You are declined.</li>
          <li>You stop responding.</li>
          <li>You cancel after we are able to submit the application.</li>
          <li>We ask for a document or an answer we need in order to review or submit, and you do not provide it.</li>
        </ul>
        <p>Not sending that document or answer is the same as stopping. If we make the request and you do not respond for 10 business days, that counts as you stopping, and the fee is not refunded.</p>
        <h2>When it is refunded</h2>
        <p>Only when we cannot submit for a reason on our side. We make that refund within 10 business days after it is clear we cannot submit. A decline is not a refund.</p>
        <p>The full terms are on the <a href="/terms">terms page</a>. Customer payments for your business are not taken through this fee.</p>
        <p><a class="btn-p" href="${esc(apply("/apply"))}">Apply</a></p>
      </article>`;
    default:
      return null;
  }
}

function pathCard(href: string, src: string, alt: string, title: string, benefit: string): string {
  return `<a class="path-card" href="${esc(href)}">
    <img src="${esc(src)}" alt="${esc(alt)}" width="1152" height="864">
    <h3>${esc(title)}</h3>
    <p>${esc(benefit)}</p>
  </a>`;
}

function productBlock(src: string, alt: string, title: string, href: string, copy: string): string {
  return `<article class="product">
    <img src="${esc(src)}" alt="${esc(alt)}" width="1152" height="864">
    <div>
      <h3><a href="${esc(href)}">${esc(title)}</a></h3>
      <p>${esc(copy)}</p>
    </div>
  </article>`;
}

function homePage(apply: (href: string) => string): string {
  return `<header class="home-hero">
    <h1>Processing, point of sale, and dispute defense.</h1>
    <p class="home-sub">For call centers, online stores, retailers, and restaurants. Already processing, just starting, or declined by a big bank.</p>
    <div class="home-cta">
      <a class="btn-p" href="${esc(apply("/apply"))}">Apply</a>
      <p class="home-fee">The application fee is $39.</p>
    </div>
  </header>
  <section class="home-section">
    <h2>Choose the business</h2>
    <div class="path-grid">
      ${pathCard(apply("/call-centers"), "/assets/home/home-call-centers.jpg", "Call center agents wearing headsets", "Call centers", "Take card payments over the phone, with a virtual terminal and invoicing.")}
      ${pathCard(apply("/ecommerce"), "/assets/home/home-ecommerce.jpg", "Boxes packed for an online store", "Online stores", "Add a gateway, checkout, and chargeback defense for the store.")}
      ${pathCard(apply("/retail"), "/assets/home/home-retail.jpg", "Retail counter with folded goods and a card reader", "Retail", "Take cards at the counter, on a handheld, or with tap to pay.")}
      ${pathCard(apply("/restaurants"), "/assets/home/home-restaurants.jpg", "Server holding a handheld card reader in a restaurant", "Restaurants", "Check out at the table or the counter with a handheld.")}
      ${pathCard(apply("/dispute-defense"), "/assets/home/home-dispute.jpg", "Business owner reviewing dispute paperwork", "Dispute defense", "For a business that already accepts cards and wants dispute tools.")}
      ${pathCard(apply("/declined"), "/assets/home/home-declined.jpg", "Shop owner holding a plain envelope", "Declined by a big bank", "A bank decline does not stop the PaycoreOS application.")}
    </div>
    <p class="home-also">Already processing? <a href="${esc(apply("/switching"))}">Bring your statement.</a> New business? <a href="${esc(apply("/startups"))}">Open a first merchant account.</a></p>
  </section>
  <section class="home-section home-products">
    <h2>What you can add</h2>
    <div class="product-list">
      ${productBlock("/assets/home/home-take-payment.jpg", "Hand tapping a card on an unbranded reader", "Take the payment", apply("/services"), "Cards in person, online, and by phone. Bank payments, a virtual terminal, and payment links.")}
      ${productBlock("/assets/home/home-bill-again.jpg", "Merchant sending an invoice from a phone", "Bill again", apply("/services"), "Send an invoice by email or text, bill on a schedule, and keep a card on file.")}
      ${productBlock("/assets/home/home-pos.jpg", "Unbranded counter terminal and handheld reader", "In-person point of sale", apply("/retail"), "A counter terminal, a handheld, or tap to pay on a phone. A Clover terminal you already own can be connected.")}
      ${productBlock("/assets/home/home-dispute.jpg", "Business owner reviewing dispute paperwork", "Dispute defense", apply("/dispute-defense"), "Visa and Mastercard dispute tools for a business that already accepts cards. This does not open a new processing account.")}
      ${productBlock("/assets/home/home-gateways.jpg", "Person shopping on a laptop beside a bag", "Authorize.Net and NMI", apply("/services"), "PaycoreOS resells the Authorize.Net gateway and the NMI gateway for checkout and hosted payments.")}
    </div>
  </section>`;
}

export function seoOrThrow(path: string): PageSeo {
  const seo = pageSeo(path);
  if (!seo) throw new Error(`missing seo for ${path}`);
  return seo;
}
