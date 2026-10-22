import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { sendWithdrawalAck } from "@/lib/email";
import { getOrderByNumber } from "@/lib/orders";
import { formsEnabled, showcaseResponse } from "@/lib/showcase";
import { readJson, zEmail, zLocale, zOrderNumber } from "@/lib/api";

const Body = z.object({
  email: zEmail,
  number: zOrderNumber,
  name: z.string().trim().min(1).max(200),
  reason: z.string().trim().max(2000).optional(),
  confirm: z.literal(true),
  locale: zLocale,
});

/** The online withdrawal function: records the withdrawal and acknowledges it on a durable medium (email). */
export async function POST(req: Request) {
  if (!formsEnabled()) return showcaseResponse();
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { email, number, name, reason, locale } = parsed.data;

  const order = await getOrderByNumber(number);
  if (!order || order.email.toLowerCase() !== email) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [row] = await db()
    .insert(schema.withdrawalRequests)
    .values({ orderId: order.id, email, name, reason: reason || null })
    .returning();
  await db().update(schema.orders).set({ status: "withdrawn", updatedAt: new Date() }).where(eq(schema.orders.id, order.id));
  await sendWithdrawalAck({ email, name, locale, number: order.number, at: row.createdAt, reason });

  return NextResponse.json({ ok: true, email });
}
