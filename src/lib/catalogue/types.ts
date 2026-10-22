import type { Locale } from "@/i18n/routing";

/** A string translated into every storefront locale. */
export type Localized = Record<Locale, string>;

export type ProductType = "shampoo" | "conditioner" | "hair-oil" | "treatment";
export type HairType = "fine" | "normal" | "thick" | "curly" | "oily" | "dry";

/**
 * A product claim. Every claim must come from the brand and pass review
 * against EU Reg. 1223/2009 and 655/2013 before `reviewed` is set to true.
 */
export interface Claim {
  text: Localized;
  reviewed: boolean;
}

export interface Variant {
  sku: string;
  /** Display label, e.g. "250 ml". */
  size: Localized;
  /** Net content in ml or g, for the label line on the product page. */
  netContent: string;
  /** VAT-inclusive price in euro cents. */
  priceCents: number;
  /** Lowest price in the last 30 days, for compliant reference pricing (Omnibus). */
  lowestPrice30dCents?: number;
  subscribable: boolean;
  /** True while the price is a placeholder supplied by the developer, not the brand. */
  pricePlaceholder?: boolean;
}

export interface ProductImage {
  src: string;
  alt: Localized;
  width: number;
  height: number;
}

export interface Product {
  slug: string;
  type: ProductType;
  hairTypes: HairType[];
  name: Localized;
  tagline: Localized;
  description: Localized;
  howToUse: Localized;
  /** Full INCI list, in the order printed on pack. INCI names are not translated. */
  inci: string;
  /** Period after opening in months (the open-jar symbol). */
  paoMonths: number;
  warnings: Localized;
  claims: Claim[];
  faq: { q: Localized; a: Localized }[];
  images: ProductImage[];
  variants: Variant[];
  /** Product slugs suggested as cross-sell. */
  crossSell: string[];
  bestseller?: boolean;
  /** True while names, copy or INCI are placeholders awaiting brand input. */
  placeholder?: boolean;
}

export interface Bundle {
  slug: string;
  name: Localized;
  description: Localized;
  /** SKUs included, one unit each. */
  skus: string[];
  /** VAT-inclusive bundle price in euro cents. */
  priceCents: number;
  image: ProductImage;
  pricePlaceholder?: boolean;
}

export interface SubscriptionPlan {
  /** Delivery interval in weeks. */
  intervalWeeks: number;
  /** Discount on the one-off price, in percent. */
  discountPercent: number;
}

/**
 * The storefront reads the catalogue only through this interface, so the
 * local config can later be swapped for a headless CMS or Odoo.
 */
export interface CatalogueProvider {
  listProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
  listBundles(): Promise<Bundle[]>;
  getBundle(slug: string): Promise<Bundle | undefined>;
  findVariant(sku: string): Promise<{ product: Product; variant: Variant } | undefined>;
  subscriptionPlans(): Promise<SubscriptionPlan[]>;
}
