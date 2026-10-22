function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}

/** Public site settings. Legal details are placeholders until the brand supplies them. */
export const site = {
  url: siteUrl(),
  name: "Ajoin & Shine",
  company: {
    name: "TODO_BRAND: legal entity name",
    address: "TODO_BRAND: registered address",
    vat: "TODO_BRAND: VAT number",
    enterpriseNumber: "TODO_BRAND: KBO/BCE enterprise number",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "TODO_BRAND: contact email",
    phone: "TODO_BRAND: phone (optional)",
  },
  responsiblePerson: {
    name: "TODO_BRAND: Responsible Person name",
    address: "TODO_BRAND: Responsible Person EU address",
  },
} as const;

export const isTodo = (v: string) => v.startsWith("TODO");

/** Public-facing value: null while it's still a TODO placeholder, so the UI can leave it out. */
export const pub = (v?: string | null) => (v && !v.trim().startsWith("TODO") ? v : null);
