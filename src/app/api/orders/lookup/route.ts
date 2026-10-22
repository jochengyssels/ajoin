import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { sendOrderLookupLink } from "@/lib/email";
import { getOrderByNumber } from "@/lib/orders";
import { site } from "@/lib/site";
import { newToken } from "@/lib/tokens";
import { formsEnabled, showcaseResponse } from "@/lib/showcase";
import { readJson, zEmail, zLocale, zOrderNumber } from "@/lib/api";

const Body = z.object({ email: zEmail, number: zOrderNumber, locale: zLocale });

/** Always answers the same way, so it can't be used to discover which orders exist. */
export async function POST(req: Request) {
  if (!formsEnabled()) return showcaseResponse();
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { email, number, locale } = parsed.data;

  const order = await getOrderByNumber(number);
  if (order && order.email.toLowerCase() === email) {
    const { token, hash } = newToken();
    await db()
      .insert(schema.orderLookupTokens)
      .values({ orderId: order.id, tokenHash: hash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
    await sendOrderLookupLink(order.email, locale, order.number, `${site.url}/${locale}/orders/view?token=${token}`);
  }
  return NextResponse.json({ ok: true });
}
