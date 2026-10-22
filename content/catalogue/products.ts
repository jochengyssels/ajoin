/**
 * Product catalogue. Ajoin & Shine sells one product: the shampoo.
 *
 * Fill every TODO_BRAND value with the brand's real data. Until then:
 * - a placeholder price (`pricePlaceholder: true`) is never shown and the
 *   product can't be added to the cart ("available soon" instead);
 * - TODO text fields are hidden from visitors;
 * - live checkout refuses to start (src/lib/catalogue/readiness.ts).
 *
 * Claims: only claims supplied by the brand, `reviewed: false` until the
 * Responsible Person has signed them off. Never medical claims.
 */
import type { Bundle, Localized, Product, SubscriptionPlan } from "@/lib/catalogue/types";

const todo = (what: string): Localized => ({
  en: `TODO_BRAND: ${what}`,
  fr: `TODO_BRAND: ${what}`,
  nl: `TODO_BRAND: ${what}`,
  it: `TODO_BRAND: ${what}`,
});

export const SHAMPOO_SLUG = "ajoin-shine-shampoo";

export const products: Product[] = [
  {
    slug: SHAMPOO_SLUG,
    type: "shampoo",
    hairTypes: [],
    bestseller: true,
    placeholder: true,
    name: {
      en: "Ajoin & Shine Shampoo",
      fr: "Shampooing Ajoin & Shine",
      nl: "Ajoin & Shine shampoo",
      it: "Shampoo Ajoin & Shine",
    },
    tagline: {
      en: "Shampoo made with onion extract.",
      fr: "Shampooing à l’extrait d’oignon.",
      nl: "Shampoo met ajuinextract.",
      it: "Shampoo all’estratto di cipolla.",
    },
    description: todo("product description"),
    howToUse: todo("how-to-use text as on pack"),
    inci: "TODO_BRAND: full INCI list as printed on pack",
    paoMonths: null, // TODO_BRAND: period after opening in months, from the pack
    warnings: todo("warnings as printed on pack"),
    claims: [],
    faq: [],
    images: [
      {
        // TODO_BRAND: replace with product photography (1200×1500). Shows the brand badge until then.
        src: "/images/product-shampoo.jpg",
        alt: {
          en: "Ajoin & Shine logo: an onion in a jester's cap",
          fr: "Logo Ajoin & Shine : un oignon coiffé d’un bonnet de bouffon",
          nl: "Logo van Ajoin & Shine: een ajuin met een zotskap",
          it: "Logo Ajoin & Shine: una cipolla con il berretto da giullare",
        },
        width: 1200,
        height: 1500,
      },
    ],
    variants: [
      {
        sku: "AJ-SH-01", // TODO_BRAND: real SKU / EAN
        size: todo("bottle size, e.g. 250 ml"),
        netContent: "TODO_BRAND: net content",
        priceCents: 0, // TODO_BRAND: VAT-inclusive price in cents
        subscribable: false,
        pricePlaceholder: true,
      },
    ],
    crossSell: [],
  },
];

export const bundles: Bundle[] = [];

/** Subscribe-and-save is built in but off. Add plans here to switch it on. */
export const subscriptionPlans: SubscriptionPlan[] = [];
