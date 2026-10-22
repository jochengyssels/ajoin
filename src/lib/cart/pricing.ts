import type { Bundle, Product, SubscriptionPlan, Variant } from "@/lib/catalogue/types";
import type { Cart, CartLine } from "./types";
import { lineKey } from "./types";

export interface CatalogueSnapshot {
  products: Product[];
  bundles: Bundle[];
  plans: SubscriptionPlan[];
}

export interface PricedLine {
  key: string;
  line: CartLine;
  /** VAT-inclusive unit price in cents, after any subscription discount. */
  unitCents: number;
  /** Unit price before subscription discount (for strike-through in the cart). */
  baseUnitCents: number;
  totalCents: number;
  recurring?: { intervalWeeks: number; discountPercent: number };
  product?: Product;
  variant?: Variant;
  bundle?: Bundle;
}

export interface PricedCart {
  lines: PricedLine[];
  subtotalCents: number;
  hasSubscription: boolean;
  /** Lines that referenced unknown items and were dropped. */
  dropped: CartLine[];
}

/** Subscription price: discount applied to the unit, rounded to the cent. */
export function subscriptionUnitPrice(baseCents: number, discountPercent: number): number {
  return Math.round((baseCents * (100 - discountPercent)) / 100);
}

export function findVariant(products: Product[], sku: string) {
  for (const product of products) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

/**
 * Prices a cart against the catalogue. This is the single source of truth for
 * prices on both client and server; the server re-runs it before checkout so
 * a tampered client cart cannot change what Stripe charges.
 */
export function priceCart(cart: Cart, cat: CatalogueSnapshot): PricedCart {
  const lines: PricedLine[] = [];
  const dropped: CartLine[] = [];

  for (const line of cart.lines) {
    if (line.kind === "bundle") {
      const bundle = cat.bundles.find((b) => b.slug === line.slug);
      if (!bundle) {
        dropped.push(line);
        continue;
      }
      lines.push({
        key: lineKey(line),
        line,
        bundle,
        unitCents: bundle.priceCents,
        baseUnitCents: bundle.priceCents,
        totalCents: bundle.priceCents * line.qty,
      });
      continue;
    }

    const found = findVariant(cat.products, line.sku);
    if (!found) {
      dropped.push(line);
      continue;
    }
    const { product, variant } = found;
    let unit = variant.priceCents;
    let recurring: PricedLine["recurring"];
    if (line.intervalWeeks !== undefined) {
      const plan = cat.plans.find((p) => p.intervalWeeks === line.intervalWeeks);
      if (!plan || !variant.subscribable) {
        dropped.push(line);
        continue;
      }
      unit = subscriptionUnitPrice(variant.priceCents, plan.discountPercent);
      recurring = { intervalWeeks: plan.intervalWeeks, discountPercent: plan.discountPercent };
    }
    lines.push({
      key: lineKey(line),
      line,
      product,
      variant,
      unitCents: unit,
      baseUnitCents: variant.priceCents,
      totalCents: unit * line.qty,
      recurring,
    });
  }

  return {
    lines,
    subtotalCents: lines.reduce((s, l) => s + l.totalCents, 0),
    hasSubscription: lines.some((l) => l.recurring),
    dropped,
  };
}

/** Progress toward free shipping, 0..1, and the amount still missing. */
export function freeShippingProgress(subtotalCents: number, thresholdCents: number) {
  const remainingCents = Math.max(0, thresholdCents - subtotalCents);
  return {
    remainingCents,
    progress: thresholdCents <= 0 ? 1 : Math.min(1, subtotalCents / thresholdCents),
    qualifies: remainingCents === 0,
  };
}

export function shippingCostCents(
  subtotalCents: number,
  rateCents: number,
  thresholdCents: number,
): number {
  return subtotalCents >= thresholdCents ? 0 : rateCents;
}
