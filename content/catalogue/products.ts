/**
 * Product catalogue.
 *
 * TODO_BRAND: everything flagged `placeholder` / `pricePlaceholder` is sample
 * data so the shop can be built and tested. Replace it with the brand's real
 * names, prices, INCI lists and copy. Production checkout refuses to start
 * while any placeholder remains (see src/lib/catalogue/readiness.ts).
 *
 * Claims: add only claims supplied by the brand, with `reviewed: false` until
 * the Responsible Person has signed them off. Never medical claims.
 */
import type { Bundle, Localized, Product, SubscriptionPlan } from "@/lib/catalogue/types";

const todo = (en: string): Localized => ({
  en: `TODO_BRAND: ${en}`,
  fr: `TODO_BRAND: ${en}`,
  nl: `TODO_BRAND: ${en}`,
  it: `TODO_BRAND: ${en}`,
});

const img = (file: string, alt: Localized) => ({
  src: `/images/${file}`,
  alt,
  width: 1200,
  height: 1500,
});

export const products: Product[] = [
  {
    slug: "onion-shampoo",
    type: "shampoo",
    hairTypes: ["fine", "normal", "oily"],
    bestseller: true,
    placeholder: true,
    name: {
      en: "Onion Shampoo",
      fr: "Shampooing à l’oignon",
      nl: "Ajuinshampoo",
      it: "Shampoo alla cipolla",
    },
    tagline: {
      en: "The everyday wash, made with onion extract.",
      fr: "Le lavage de tous les jours, à l’extrait d’oignon.",
      nl: "De dagelijkse wasbeurt, met ajuinextract.",
      it: "Il lavaggio di tutti i giorni, con estratto di cipolla.",
    },
    description: todo("Product description supplied by the brand."),
    howToUse: todo("How-to-use text supplied by the brand."),
    inci: "TODO_BRAND: full INCI list as printed on pack",
    paoMonths: 12,
    warnings: todo("Warnings as printed on pack."),
    claims: [],
    faq: [
      {
        q: {
          en: "Does it smell of onion?",
          fr: "Est-ce que ça sent l’oignon ?",
          nl: "Ruikt het naar ajuin?",
          it: "Profuma di cipolla?",
        },
        a: todo("Answer supplied by the brand."),
      },
    ],
    images: [
      img("placeholder-shampoo-1.jpg", {
        en: "Bottle of Ajoin onion shampoo",
        fr: "Flacon de shampooing à l’oignon Ajoin",
        nl: "Fles Ajoin ajuinshampoo",
        it: "Flacone di shampoo alla cipolla Ajoin",
      }),
      img("placeholder-shampoo-2.jpg", {
        en: "Ajoin onion shampoo lather",
        fr: "Mousse du shampooing à l’oignon Ajoin",
        nl: "Schuim van Ajoin ajuinshampoo",
        it: "Schiuma dello shampoo alla cipolla Ajoin",
      }),
    ],
    variants: [
      {
        sku: "AJ-SH-250",
        size: { en: "250 ml", fr: "250 ml", nl: "250 ml", it: "250 ml" },
        netContent: "250 ml",
        priceCents: 2490,
        subscribable: true,
        pricePlaceholder: true,
      },
      {
        sku: "AJ-SH-500",
        size: { en: "500 ml", fr: "500 ml", nl: "500 ml", it: "500 ml" },
        netContent: "500 ml",
        priceCents: 3990,
        subscribable: true,
        pricePlaceholder: true,
      },
    ],
    crossSell: ["onion-conditioner", "onion-hair-oil"],
  },
  {
    slug: "onion-conditioner",
    type: "conditioner",
    hairTypes: ["normal", "thick", "curly", "dry"],
    placeholder: true,
    name: {
      en: "Onion Conditioner",
      fr: "Après-shampooing à l’oignon",
      nl: "Ajuinconditioner",
      it: "Balsamo alla cipolla",
    },
    tagline: {
      en: "The follow-up to the shampoo.",
      fr: "La suite logique du shampooing.",
      nl: "Het vervolg op de shampoo.",
      it: "Il seguito naturale dello shampoo.",
    },
    description: todo("Product description supplied by the brand."),
    howToUse: todo("How-to-use text supplied by the brand."),
    inci: "TODO_BRAND: full INCI list as printed on pack",
    paoMonths: 12,
    warnings: todo("Warnings as printed on pack."),
    claims: [],
    faq: [],
    images: [
      img("placeholder-conditioner-1.jpg", {
        en: "Bottle of Ajoin onion conditioner",
        fr: "Flacon d’après-shampooing à l’oignon Ajoin",
        nl: "Fles Ajoin ajuinconditioner",
        it: "Flacone di balsamo alla cipolla Ajoin",
      }),
    ],
    variants: [
      {
        sku: "AJ-CO-250",
        size: { en: "250 ml", fr: "250 ml", nl: "250 ml", it: "250 ml" },
        netContent: "250 ml",
        priceCents: 2290,
        subscribable: true,
        pricePlaceholder: true,
      },
    ],
    crossSell: ["onion-shampoo", "onion-hair-oil"],
  },
  {
    slug: "onion-hair-oil",
    type: "hair-oil",
    hairTypes: ["thick", "curly", "dry"],
    placeholder: true,
    name: {
      en: "Onion Hair Oil",
      fr: "Huile capillaire à l’oignon",
      nl: "Ajuin-haarolie",
      it: "Olio per capelli alla cipolla",
    },
    tagline: {
      en: "A few drops on the lengths.",
      fr: "Quelques gouttes sur les longueurs.",
      nl: "Een paar druppels in de lengtes.",
      it: "Qualche goccia sulle lunghezze.",
    },
    description: todo("Product description supplied by the brand."),
    howToUse: todo("How-to-use text supplied by the brand."),
    inci: "TODO_BRAND: full INCI list as printed on pack",
    paoMonths: 12,
    warnings: todo("Warnings as printed on pack."),
    claims: [],
    faq: [],
    images: [
      img("placeholder-oil-1.jpg", {
        en: "Dropper bottle of Ajoin onion hair oil",
        fr: "Flacon compte-gouttes d’huile capillaire à l’oignon Ajoin",
        nl: "Druppelflesje Ajoin ajuin-haarolie",
        it: "Flacone contagocce di olio per capelli alla cipolla Ajoin",
      }),
    ],
    variants: [
      {
        sku: "AJ-OI-50",
        size: { en: "50 ml", fr: "50 ml", nl: "50 ml", it: "50 ml" },
        netContent: "50 ml",
        priceCents: 2790,
        subscribable: false,
        pricePlaceholder: true,
      },
    ],
    crossSell: ["onion-shampoo", "onion-conditioner"],
  },
];

export const bundles: Bundle[] = [
  {
    slug: "wash-and-condition",
    name: {
      en: "Shampoo + Conditioner",
      fr: "Shampooing + Après-shampooing",
      nl: "Shampoo + Conditioner",
      it: "Shampoo + Balsamo",
    },
    description: {
      en: "The pair, together for less.",
      fr: "Le duo, ensemble pour moins cher.",
      nl: "Het duo, samen voordeliger.",
      it: "La coppia, insieme a meno.",
    },
    skus: ["AJ-SH-250", "AJ-CO-250"],
    priceCents: 4290,
    pricePlaceholder: true,
    image: img("placeholder-bundle-1.jpg", {
      en: "Ajoin shampoo and conditioner side by side",
      fr: "Shampooing et après-shampooing Ajoin côte à côte",
      nl: "Ajoin shampoo en conditioner naast elkaar",
      it: "Shampoo e balsamo Ajoin uno accanto all’altro",
    }),
  },
  {
    slug: "full-ritual",
    name: {
      en: "The full ritual",
      fr: "Le rituel complet",
      nl: "Het volledige ritueel",
      it: "Il rituale completo",
    },
    description: {
      en: "Shampoo, conditioner and hair oil.",
      fr: "Shampooing, après-shampooing et huile capillaire.",
      nl: "Shampoo, conditioner en haarolie.",
      it: "Shampoo, balsamo e olio per capelli.",
    },
    skus: ["AJ-SH-250", "AJ-CO-250", "AJ-OI-50"],
    priceCents: 6490,
    pricePlaceholder: true,
    image: img("placeholder-bundle-2.jpg", {
      en: "Ajoin shampoo, conditioner and hair oil",
      fr: "Shampooing, après-shampooing et huile capillaire Ajoin",
      nl: "Ajoin shampoo, conditioner en haarolie",
      it: "Shampoo, balsamo e olio per capelli Ajoin",
    }),
  },
];

/** TODO_BRAND: confirm intervals and discount. */
export const subscriptionPlans: SubscriptionPlan[] = [
  { intervalWeeks: 4, discountPercent: 10 },
  { intervalWeeks: 8, discountPercent: 10 },
];
