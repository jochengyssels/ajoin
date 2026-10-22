import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { sendNewsletterConfirm } from "@/lib/email";
import { site } from "@/lib/site";
import { newToken } from "@/lib/tokens";
import { formsEnabled, showcaseResponse } from "@/lib/showcase";
import { readJson, zEmail, zLocale } from "@/lib/api";

const Body = z.object({ email: zEmail, locale: zLocale, company: z.string().optional().nullable() });

/** Step one of double opt-in: store as pending and email a confirmation link. */
export async function POST(req: Request) {
  if (!formsEnabled()) return showcaseResponse();
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { email, locale, company } = parsed.data;
  if (company) return NextResponse.json({ ok: true }); // honeypot filled: silently drop

  const { token, hash } = newToken();
  const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const [row] = await db()
    .insert(schema.newsletterSubscribers)
    .values({ email, locale, status: "pending", tokenHash: hash, tokenExpiresAt: expires })
    .onConflictDoUpdate({
      target: schema.newsletterSubscribers.email,
      set: { locale, tokenHash: hash, tokenExpiresAt: expires, requestedAt: new Date() },
    })
    .returning();

  if (row.status !== "confirmed") {
    await sendNewsletterConfirm(email, locale, `${site.url}/api/newsletter/confirm?token=${token}&locale=${locale}`);
  }
  return NextResponse.json({ ok: true });
}
