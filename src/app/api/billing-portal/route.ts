import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { site } from "@/lib/site";
import { stripe } from "@/lib/stripe/client";
import { hashToken } from "@/lib/tokens";

/** Opens the Stripe customer portal (change or cancel a subscription), authorised by a valid order link. */
export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const locale = String(form.get("locale") ?? "nl");
  const row = await db().query.orderLookupTokens.findFirst({
    where: and(eq(schema.orderLookupTokens.tokenHash, hashToken(token)), gt(schema.orderLookupTokens.expiresAt, new Date())),
  });
  const order = row && (await db().query.orders.findFirst({ where: eq(schema.orders.id, row.orderId) }));
  if (!order?.stripeCustomerId) return NextResponse.redirect(`${site.url}/${locale}/orders?expired=1`, 303);

  const portal = await stripe().billingPortal.sessions.create({
    customer: order.stripeCustomerId,
    return_url: `${site.url}/${locale}/orders`,
    locale: locale as "nl" | "fr" | "it" | "en",
  });
  return NextResponse.redirect(portal.url, 303);
}
