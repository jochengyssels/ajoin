import { describe, expect, it } from "vitest";
import { priceCart, type CatalogueSnapshot } from "@/lib/cart/pricing";
import { buildCheckoutParams } from "@/lib/stripe/checkout";
import type { Product } from "@/lib/catalogue/types";

// Fixture catalogue, independent of the live product data.
const L = (s: string) => ({ en: s, fr: s, nl: s, it: s });
const product = (slug: string, sku: string, priceCents: number): Product => ({
  slug,
  type: "shampoo",
  hairTypes: [],
  name: L(slug),
  tagline: L(""),
  description: L(""),
  howToUse: L(""),
  inci: "",
  paoMonths: 12,
  warnings: L(""),
  claims: [],
  faq: [],
  images: [],
  variants: [{ sku, size: L("250 ml"), netContent: "250 ml", priceCents, subscribable: true }],
  crossSell: [],
});
const cat: CatalogueSnapshot = {
  products: [product("shampoo", "SH", 2490), product("other", "OT", 2290)],
  bundles: [],
  plans: [
    { intervalWeeks: 4, discountPercent: 10 },
    { intervalWeeks: 8, discountPercent: 10 },
  ],
};
const rate = { country: "BE" as const, carrier: "Carrier", amountCents: 495, minDays: 1, maxDays: 3 };
const base = { locale: "nl" as const, rate, freeShippingThresholdCents: 4000, siteUrl: "https://shop.test", automaticTax: true, shippingLabel: "Verzending" };

describe("buildCheckoutParams", () => {
  it("rejects an empty cart", () => {
    expect(buildCheckoutParams({ ...base, priced: priceCart({ lines: [] }, cat) })).toBe("empty_cart");
  });

  it("builds a payment session with VAT-inclusive prices and paid shipping under the threshold", () => {
    const priced = priceCart({ lines: [{ kind: "variant", sku: "SH", qty: 1 }] }, cat);
    const p = buildCheckoutParams({ ...base, priced });
    if (typeof p === "string") throw new Error(p);
    expect(p.mode).toBe("payment");
    expect(p.line_items?.[0].price_data?.tax_behavior).toBe("inclusive");
    expect(p.line_items?.[0].price_data?.unit_amount).toBe(2490);
    expect(p.shipping_address_collection?.allowed_countries).toEqual(["BE"]);
    expect(p.shipping_options?.[0].shipping_rate_data?.fixed_amount?.amount).toBe(495);
    expect(p.automatic_tax?.enabled).toBe(true);
    expect(p.success_url).toContain("/nl/checkout/success");
  });

  it("ships free at the threshold", () => {
    const priced = priceCart({ lines: [{ kind: "variant", sku: "SH", qty: 2 }] }, cat);
    const p = buildCheckoutParams({ ...base, priced });
    if (typeof p === "string") throw new Error(p);
    expect(p.shipping_options?.[0].shipping_rate_data?.fixed_amount?.amount).toBe(0);
  });

  it("uses subscription mode with a recurring shipping line", () => {
    const priced = priceCart({ lines: [{ kind: "variant", sku: "SH", qty: 1, intervalWeeks: 4 }] }, cat);
    const p = buildCheckoutParams({ ...base, priced });
    if (typeof p === "string") throw new Error(p);
    expect(p.mode).toBe("subscription");
    expect(p.shipping_options).toBeUndefined();
    const ship = p.line_items?.find((l) => l.price_data?.product_data?.metadata?.shipping);
    expect(ship?.price_data?.recurring).toEqual({ interval: "week", interval_count: 4 });
  });

  it("refuses subscriptions with different intervals", () => {
    const priced = priceCart(
      {
        lines: [
          { kind: "variant", sku: "SH", qty: 1, intervalWeeks: 4 },
          { kind: "variant", sku: "OT", qty: 1, intervalWeeks: 8 },
        ],
      },
      cat,
    );
    expect(buildCheckoutParams({ ...base, priced })).toBe("mixed_intervals");
  });
});
