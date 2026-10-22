import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgSequence, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type OrderStatus = "paid" | "fulfilled" | "cancelled" | "refunded" | "withdrawn";

export interface Address {
  name?: string | null;
  line1?: string | null;
  line2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
}

export const orderNumberSeq = pgSequence("order_number_seq", { startWith: 10001 });

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    /** Customer-facing number, e.g. AJ-10042. */
    number: text("number")
      .notNull()
      .unique()
      .default(sql`'AJ-' || nextval('order_number_seq')`),
    /** Set for orders created by Checkout. */
    stripeSessionId: text("stripe_session_id").unique(),
    /** Set for subscription renewal orders. */
    stripeInvoiceId: text("stripe_invoice_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    email: text("email").notNull(),
    name: text("name"),
    locale: text("locale").notNull().default("nl"),
    status: text("status").$type<OrderStatus>().notNull().default("paid"),
    currency: text("currency").notNull().default("eur"),
    subtotalCents: integer("subtotal_cents").notNull(),
    shippingCents: integer("shipping_cents").notNull().default(0),
    discountCents: integer("discount_cents").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    shippingAddress: jsonb("shipping_address").$type<Address>(),
    isRenewal: boolean("is_renewal").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_email_idx").on(t.email), index("orders_created_idx").on(t.createdAt)],
);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  sku: text("sku"),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitCents: integer("unit_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  intervalWeeks: integer("interval_weeks"),
});

/** Every processed Stripe event id, so redelivered webhooks are ignored. */
export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Single-use magic links for order lookup. Only the hash is stored. */
export const orderLookupTokens = pgTable("order_lookup_tokens", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  locale: text("locale").notNull(),
  status: text("status").$type<"pending" | "confirmed" | "unsubscribed">().notNull().default("pending"),
  tokenHash: text("token_hash"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  /** Moment of double opt-in confirmation: the consent record. */
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
});

/** Withdrawals submitted through the online withdrawal function (Art. 11a CRD). */
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  name: text("name").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ many }) => ({ items: many(orderItems) }));
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
