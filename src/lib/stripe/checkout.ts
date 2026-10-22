import type Stripe from "stripe";
import type { Locale } from "@/i18n/routing";
import type { PricedCart, PricedLine } from "@/lib/cart/pricing";
import { shippingCostCents } from "@/lib/cart/pricing";
import type { ShippingRate } from "../../../content/shipping";

export type CheckoutError = "empty_cart" | "mixed_intervals" | "unknown_country";

export interface CheckoutInput {
  priced: PricedCart;
  locale: Locale;
  rate: ShippingRate;
  freeShippingThresholdCents: number;
  siteUrl: string;
  automaticTax: boolean;
  /** Localised label for the shipping line on subscription orders. */
  shippingLabel: string;
}

function lineName(l: PricedLine, locale: Locale) {
  if (l.bundle) return l.bundle.name[locale];
  return `${l.product!.name[locale]} (${l.variant!.size[locale]})`;
}

/**
 * Builds Stripe Checkout session parameters from a server-priced cart.
 * Pure: no network calls, so it is unit-tested directly.
 *
 * - Prices are VAT-inclusive (tax_behavior "inclusive"); with Stripe Tax on,
 *   the VAT for the destination country is extracted from that price.
 * - Payment mode uses a Checkout shipping option for the chosen country.
 * - Subscription mode can't use shipping options, so shipping becomes a
 *   recurring line on the same interval (free above the threshold).
 */
export function buildCheckoutParams(input: CheckoutInput): Stripe.Checkout.SessionCreateParams | CheckoutError {
  const { priced, locale, rate, freeShippingThresholdCents, siteUrl, automaticTax } = input;
  if (priced.lines.length === 0) return "empty_cart";

  const intervals = new Set(priced.lines.filter((l) => l.recurring).map((l) => l.recurring!.intervalWeeks));
  if (intervals.size > 1) return "mixed_intervals";
  const intervalWeeks = [...intervals][0];
  const mode: Stripe.Checkout.SessionCreateParams.Mode = intervalWeeks ? "subscription" : "payment";

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priced.lines.map((l) => ({
    quantity: l.line.qty,
    price_data: {
      currency: "eur",
      unit_amount: l.unitCents,
      tax_behavior: "inclusive",
      product_data: {
        name: lineName(l, locale),
        // txcd_99999999 = general tangible goods. Cosmetics fall under the standard VAT rate.
        tax_code: "txcd_99999999",
        metadata: (l.bundle ? { bundle: l.bundle.slug } : { sku: l.variant!.sku }) as Record<string, string>,
      },
      ...(l.recurring ? { recurring: { interval: "week", interval_count: l.recurring.intervalWeeks } } : {}),
    },
  }));

  const shippingCents = shippingCostCents(priced.subtotalCents, rate.amountCents, freeShippingThresholdCents);

  const params: Stripe.Checkout.SessionCreateParams = {
    mode,
    locale,
    line_items: lineItems,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    shipping_address_collection: { allowed_countries: [rate.country] },
    phone_number_collection: { enabled: false },
    automatic_tax: { enabled: automaticTax },
    success_url: `${siteUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/${locale}/checkout/cancel`,
    metadata: { locale, country: rate.country },
  };

  if (mode === "payment") {
    params.customer_creation = "always";
    params.shipping_options = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: rate.carrier,
          fixed_amount: { amount: shippingCents, currency: "eur" },
          tax_behavior: "inclusive",
          delivery_estimate: {
            minimum: { unit: "business_day", value: rate.minDays },
            maximum: { unit: "business_day", value: rate.maxDays },
          },
        },
      },
    ];
    params.payment_intent_data = { metadata: { locale } };
  } else {
    if (shippingCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: shippingCents,
          tax_behavior: "inclusive",
          recurring: { interval: "week", interval_count: intervalWeeks! },
          product_data: { name: input.shippingLabel, tax_code: "txcd_92010001", metadata: { shipping: "1" } },
        },
      });
    }
    params.subscription_data = { metadata: { locale, country: rate.country } };
  }

  return params;
}
