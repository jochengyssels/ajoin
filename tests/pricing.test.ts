import { describe, expect, it } from "vitest";
import { freeShippingProgress, priceCart, shippingCostCents, subscriptionUnitPrice, type CatalogueSnapshot } from "@/lib/cart/pricing";
import type { Product } from "@/lib/catalogue/types";

const L = (s: string) => ({ en: s, fr: s, nl: s, it: s });
const product = (slug: string, variants: Product["variants"]): Product => ({
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
  variants,
  crossSell: [],
});

const cat: CatalogueSnapshot = {
  products: [
    product("sh", [
      { sku: "SH", size: L("250"), netContent: "250 ml", priceCents: 2490, subscribable: true },
      { sku: "SH-NS", size: L("50"), netContent: "50 ml", priceCents: 999, subscribable: false },
    ]),
  ],
  bundles: [{ slug: "duo", name: L("duo"), description: L(""), skus: ["SH"], priceCents: 4290, image: { src: "", alt: L(""), width: 1, height: 1 } }],
  plans: [{ intervalWeeks: 4, discountPercent: 10 }],
};

describe("pricing", () => {
  it("rounds subscription discounts to the cent", () => {
    expect(subscriptionUnitPrice(2490, 10)).toBe(2241);
    expect(subscriptionUnitPrice(999, 15)).toBe(849);
  });

  it("prices variants, bundles and subscriptions from the catalogue", () => {
    const p = priceCart(
      {
        lines: [
          { kind: "variant", sku: "SH", qty: 2 },
          { kind: "variant", sku: "SH", qty: 1, intervalWeeks: 4 },
          { kind: "bundle", slug: "duo", qty: 1 },
        ],
      },
      cat,
    );
    expect(p.lines.map((l) => l.totalCents)).toEqual([4980, 2241, 4290]);
    expect(p.subtotalCents).toBe(4980 + 2241 + 4290);
    expect(p.hasSubscription).toBe(true);
    expect(p.dropped).toHaveLength(0);
  });

  it("drops unknown items, unknown plans and subscriptions on non-subscribable variants", () => {
    const p = priceCart(
      {
        lines: [
          { kind: "variant", sku: "NOPE", qty: 1 },
          { kind: "variant", sku: "SH", qty: 1, intervalWeeks: 3 },
          { kind: "variant", sku: "SH-NS", qty: 1, intervalWeeks: 4 },
          { kind: "bundle", slug: "nope", qty: 1 },
        ],
      },
      cat,
    );
    expect(p.lines).toHaveLength(0);
    expect(p.dropped).toHaveLength(4);
    expect(p.subtotalCents).toBe(0);
  });

  it("computes free-shipping progress and cost", () => {
    expect(freeShippingProgress(2000, 4000)).toEqual({ remainingCents: 2000, progress: 0.5, qualifies: false });
    expect(freeShippingProgress(5000, 4000)).toEqual({ remainingCents: 0, progress: 1, qualifies: true });
    expect(shippingCostCents(3999, 495, 4000)).toBe(495);
    expect(shippingCostCents(4000, 495, 4000)).toBe(0);
  });
});
