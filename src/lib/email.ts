import "server-only";
import { createTranslator } from "next-intl";
import { Resend } from "resend";
import { locales, type Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import type { OrderWithItems } from "@/lib/orders";

const from = () => process.env.EMAIL_FROM ?? "Ajoin & Shine <onboarding@resend.dev>";
const shopInbox = () => process.env.CONTACT_TO_EMAIL;

async function translator(locale: string) {
  const l = (locales as readonly string[]).includes(locale) ? (locale as Locale) : "nl";
  const messages = (await import(`../../messages/${l}.json`)).default;
  return { t: createTranslator({ locale: l, messages, namespace: "emails" }), locale: l };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#fdf7ec;font-family:Helvetica,Arial,sans-serif;color:#22061b">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
<tr><td style="background:#3b0427;padding:20px 28px;font-family:Georgia,serif;font-size:24px;color:#fdf7ec">Ajoin <span style="color:#d9964b">&amp;</span> Shine</td></tr>
<tr><td style="padding:28px">
<h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 16px">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:16px 28px;background:#f4dda8;font-size:12px;color:#22061b">${esc(site.company.name)} · ${esc(site.company.address)} · VAT ${esc(site.company.vat)}</td></tr>
</table></td></tr></table></body></html>`;
}

const p = (s: string) => `<p style="margin:0 0 14px;line-height:1.55">${s}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:20px 0"><a href="${esc(href)}" style="background:#5a1747;color:#fdf7ec;text-decoration:none;padding:12px 22px;border-radius:999px;display:inline-block;font-weight:bold">${esc(label)}</a></p>`;

async function send(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] RESEND_API_KEY missing; not sending "${subject}" to ${to}`);
    return;
  }
  const { error } = await new Resend(key).emails.send({ from: from(), to, subject, html, replyTo });
  if (error) console.error("[email] send failed", error);
}

export async function sendOrderConfirmation(order: OrderWithItems) {
  const { t, locale } = await translator(order.locale);
  const money = (c: number) => formatPrice(c, locale);
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.quantity} × ${esc(i.name)}${
          i.intervalWeeks ? `<br><span style="color:#5e4a57;font-size:13px">${esc(t("everyWeeks", { weeks: i.intervalWeeks }))}</span>` : ""
        }</td><td align="right" style="padding:6px 0">${money(i.totalCents)}</td></tr>`,
    )
    .join("");
  const a = order.shippingAddress;
  const address = a ? [a.name, a.line1, a.line2, `${a.postalCode ?? ""} ${a.city ?? ""}`, a.country].filter(Boolean).map((x) => esc(String(x))).join("<br>") : "";
  const body =
    p(esc(t("orderIntro", { name: order.name ?? "" }))) +
    p(`<strong>${esc(t("orderNumber"))}: ${esc(order.number)}</strong>`) +
    `<table width="100%" style="border-top:1px solid #e6d7c6;border-bottom:1px solid #e6d7c6;margin:8px 0 16px">${rows}
<tr><td style="padding:6px 0">${esc(t("shipping"))}</td><td align="right">${order.shippingCents ? money(order.shippingCents) : esc(t("free"))}</td></tr>
${order.discountCents ? `<tr><td style="padding:6px 0">${esc(t("discount"))}</td><td align="right">−${money(order.discountCents)}</td></tr>` : ""}
<tr><td style="padding:6px 0"><strong>${esc(t("total"))}</strong></td><td align="right"><strong>${money(order.totalCents)}</strong></td></tr>
<tr><td style="padding:0 0 6px;color:#5e4a57;font-size:13px">${esc(t("vatIncluded"))}</td><td align="right" style="color:#5e4a57;font-size:13px">${money(order.taxCents)}</td></tr></table>` +
    (address ? p(`<strong>${esc(t("shipTo"))}</strong><br>${address}`) : "") +
    button(`${site.url}/${locale}/orders`, t("viewOrder")) +
    p(`<span style="font-size:13px;color:#5e4a57">${esc(t("withdrawalNote"))} <a href="${site.url}/${locale}/withdrawal" style="color:#5a1747">${esc(t("withdrawalLink"))}</a></span>`);
  await send(order.email, t("orderSubject", { number: order.number }), layout(t("orderTitle"), body));
}

export async function sendOrderLookupLink(email: string, locale: string, number: string, link: string) {
  const { t } = await translator(locale);
  await send(email, t("lookupSubject", { number }), layout(t("lookupTitle"), p(esc(t("lookupBody"))) + button(link, t("viewOrder"))));
}

export async function sendNewsletterConfirm(email: string, locale: string, link: string) {
  const { t } = await translator(locale);
  await send(email, t("newsletterSubject"), layout(t("newsletterTitle"), p(esc(t("newsletterBody"))) + button(link, t("newsletterButton"))));
}

export async function sendWithdrawalAck(args: { email: string; name: string; locale: string; number: string; at: Date; reason?: string | null }) {
  const { t, locale } = await translator(args.locale);
  const when = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Brussels" }).format(args.at);
  const body = p(esc(t("withdrawalBody", { number: args.number, date: when }))) + p(esc(t("withdrawalReturn")));
  await send(args.email, t("withdrawalSubject", { number: args.number }), layout(t("withdrawalTitle"), body));
  const inbox = shopInbox();
  if (inbox) {
    await send(
      inbox,
      `Withdrawal: ${args.number}`,
      layout("Withdrawal received", p(esc(`${args.name} <${args.email}> withdrew from order ${args.number} on ${when}.`)) + (args.reason ? p(esc(`Reason: ${args.reason}`)) : "")),
      args.email,
    );
  }
}

export async function sendContactMessage(args: { name: string; email: string; message: string; orderNumber?: string }) {
  const inbox = shopInbox();
  if (!inbox) throw new Error("CONTACT_TO_EMAIL is not set");
  const body = p(esc(`${args.name} <${args.email}>`)) + (args.orderNumber ? p(esc(`Order: ${args.orderNumber}`)) : "") + p(esc(args.message).replace(/\n/g, "<br>"));
  await send(inbox, `Contact form: ${args.name}`, layout("New message", body), args.email);
}
