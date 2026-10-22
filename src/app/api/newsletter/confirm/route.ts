import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { site } from "@/lib/site";
import { hashToken } from "@/lib/tokens";
import { locales } from "@/i18n/routing";

const { newsletterSubscribers: subs } = schema;

/** Step two of double opt-in. Confirms and records the consent timestamp. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const l = url.searchParams.get("locale") ?? "nl";
  const locale = (locales as readonly string[]).includes(l) ? l : "nl";

  const [row] = token
    ? await db()
        .update(subs)
        .set({ status: "confirmed", confirmedAt: new Date(), tokenHash: null, tokenExpiresAt: null })
        .where(and(eq(subs.tokenHash, hashToken(token)), gt(subs.tokenExpiresAt, new Date())))
        .returning({ id: subs.id })
    : [];

  return NextResponse.redirect(`${site.url}/${locale}/newsletter/confirmed${row ? "" : "?invalid=1"}`, 303);
}
