import type { Localized } from "@/lib/catalogue/types";

/** Blog posts, newest first. Each slug has content/blog/<locale>/<slug>.mdx. */
export interface PostMeta {
  slug: string;
  date: string; // ISO date
  title: Localized;
  excerpt: Localized;
}

export const posts: PostMeta[] = [
  {
    slug: "the-onion-throw",
    date: "2026-10-22",
    title: {
      en: "Why onions rain down in Aalst",
      fr: "Pourquoi il pleut des oignons à Alost",
      nl: "Waarom het in Aalst ajuinen regent",
      it: "Perché ad Aalst piovono cipolle",
    },
    excerpt: {
      en: "The ajuinworp, the Ajuinen, and how a nickname became a brand.",
      fr: "L’ajuinworp, les Ajuinen, et comment un surnom est devenu une marque.",
      nl: "De ajuinworp, de Ajuinen, en hoe een bijnaam een merk werd.",
      it: "L’ajuinworp, gli Ajuinen, e come un soprannome è diventato un marchio.",
    },
  },
];
