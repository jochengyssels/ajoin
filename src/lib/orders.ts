import "server-only";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Address } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe/client";

const { orders, orderItems, stripeEvents } = schema;

export type OrderWithItems = typeof orders.$inferSelect & { items: (typeof orderItems.$inferSelect)[] };

const id = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

function toAddress(d: { name?: string | null; address?: Stripe.Address | null } | null | undefined): Address | null {
  if (!d?.address) return null;
  return {
    name: d.name ?? null,
    line1: d.address.line1,
    line2: d.address.line2,
    postalCode: d.address.postal_code,
    city: d.address.city,
    country: d.address.country,
  };
}

/** Records a webhook event. Returns false if it was already processed. */
export async function alreadyProcessed(eventId: string): Promise<boolean> {
  const rows = await db().select({ id: stripeEvents.id }).from(stripeEvents).where(eq(stripeEvents.id, eventId));
  return rows.length > 0;
}

export async function markProcessed(event: Stripe.Event) {
  await db().insert(stripeEvents).values({ id: event.id, type: event.type }).onConflictDoNothing();
}

/**
 * Creates the order for a completed Checkout session. Idempotent: the unique
 * stripe_session_id means a redelivered event returns null instead of a duplicate.
 */
export async function createOrderFromSession(sessionId: string): Promise<OrderWithItems | null> {
  const session = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product"],
  });
  if (session.payment_status === "unpaid") return null; // async method still pending

  const shipping = toAddress(session.collected_information?.shipping_details);
  const lines = session.line_items?.data ?? [];

  const itemRows = lines
    .filter((li) => {
      const product = li.price?.product;
      return !(product && typeof product === "object" && "metadata" in product && product.metadata?.shipping);
    })
    .map((li) => {
      const product = li.price?.product;
      const meta = product && typeof product === "object" && "metadata" in product ? product.metadata : {};
      const qty = li.quantity ?? 1;
      return {
        sku: meta.sku ?? (meta.bundle ? `bundle:${meta.bundle}` : null),
        name: li.description ?? "Item",
        quantity: qty,
        unitCents: Math.round(li.amount_subtotal / qty),
        totalCents: li.amount_total,
        intervalWeeks: li.price?.recurring?.interval_count ?? null,
      };
    });

  const shippingLine = lines.find((li) => {
    const product = li.price?.product;
    return product && typeof product === "object" && "metadata" in product && product.metadata?.shipping;
  });

  const totals = session.total_details;
  const shippingCents = (totals?.amount_shipping ?? 0) + (shippingLine?.amount_total ?? 0);
  const subtotalCents = itemRows.reduce((s, i) => s + i.totalCents, 0);

  const order = await db().transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({
        stripeSessionId: session.id,
        stripePaymentIntentId: id(session.payment_intent),
        stripeCustomerId: id(session.customer),
        stripeSubscriptionId: id(session.subscription),
        email: session.customer_details?.email ?? "",
        name: session.customer_details?.name ?? shipping?.name ?? null,
        locale: session.metadata?.locale ?? "nl",
        currency: session.currency ?? "eur",
        subtotalCents,
        shippingCents,
        discountCents: totals?.amount_discount ?? 0,
        taxCents: totals?.amount_tax ?? 0,
        totalCents: session.amount_total ?? 0,
        shippingAddress: shipping,
      })
      .onConflictDoNothing({ target: orders.stripeSessionId })
      .returning();
    if (!created) return null;
    const items = itemRows.length
      ? await tx.insert(orderItems).values(itemRows.map((i) => ({ ...i, orderId: created.id }))).returning()
      : [];
    return { ...created, items };
  });

  // Subscription renewals ship to the customer's address, so keep it on the customer.
  if (order && session.mode === "subscription" && shipping && order.stripeCustomerId) {
    await stripe().customers.update(order.stripeCustomerId, {
      shipping: {
        name: shipping.name ?? order.name ?? "",
        address: {
          line1: shipping.line1 ?? "",
          line2: shipping.line2 ?? undefined,
          postal_code: shipping.postalCode ?? undefined,
          city: shipping.city ?? undefined,
          country: shipping.country ?? undefined,
        },
      },
    });
  }

  return order;
}

/** Creates a fulfilment order for each paid subscription renewal invoice. */
export async function createOrderFromRenewal(invoice: Stripe.Invoice): Promise<OrderWithItems | null> {
  if (invoice.billing_reason !== "subscription_cycle" || !invoice.id) return null;
  const subscriptionId = id(invoice.parent?.subscription_details?.subscription);
  const lines = invoice.lines.data;
  const isShipping = (l: Stripe.InvoiceLineItem) => l.metadata?.shipping === "1" || /shipping|verzending|livraison|spedizione/i.test(l.description ?? "");

  const items = lines.filter((l) => !isShipping(l));
  const shippingCents = lines.filter(isShipping).reduce((s, l) => s + l.amount, 0);
  const taxCents = (invoice.total_taxes ?? []).reduce((s, t) => s + t.amount, 0);

  return db().transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({
        stripeInvoiceId: invoice.id,
        stripeCustomerId: id(invoice.customer),
        stripeSubscriptionId: subscriptionId,
        email: invoice.customer_email ?? "",
        name: invoice.customer_name ?? invoice.customer_shipping?.name ?? null,
        locale: invoice.parent?.subscription_details?.metadata?.locale ?? "nl",
        currency: invoice.currency,
        subtotalCents: items.reduce((s, l) => s + l.amount, 0),
        shippingCents,
        taxCents,
        totalCents: invoice.total,
        shippingAddress: toAddress(invoice.customer_shipping),
        isRenewal: true,
      })
      .onConflictDoNothing({ target: orders.stripeInvoiceId })
      .returning();
    if (!created) return null;
    const rows = items.length
      ? await tx
          .insert(orderItems)
          .values(
            items.map((l) => ({
              orderId: created.id,
              sku: null,
              name: l.description ?? "Item",
              quantity: l.quantity ?? 1,
              unitCents: Math.round(l.amount / (l.quantity ?? 1)),
              totalCents: l.amount,
              intervalWeeks: null,
            })),
          )
          .returning()
      : [];
    return { ...created, items: rows };
  });
}

export async function markRefunded(paymentIntentId: string) {
  await db()
    .update(orders)
    .set({ status: "refunded", updatedAt: new Date() })
    .where(eq(orders.stripePaymentIntentId, paymentIntentId));
}

export async function getOrderByNumber(number: string) {
  return db().query.orders.findFirst({
    where: eq(orders.number, number.trim().toUpperCase()),
    with: { items: true },
  });
}
