import type { ComponentType } from "react";
import type { Locale } from "@/i18n/routing";

/** MDX content pages, one file per locale in content/pages/<locale>/<slug>.mdx. */
export const contentPages = {
  about: { titleKey: "about", legal: false },
  ingredients: { titleKey: "ingredients", legal: false },
  faq: { titleKey: "faq", legal: false },
  terms: { titleKey: "terms", legal: true },
  privacy: { titleKey: "privacy", legal: true },
  shipping: { titleKey: "shipping", legal: true },
  "legal-notice": { titleKey: "notice", legal: true },
} as const;

export type ContentSlug = keyof typeof contentPages;
export const isContentSlug = (s: string): s is ContentSlug => s in contentPages;

export async function loadContent(locale: Locale, slug: ContentSlug) {
  const mod = (await import(`../../content/pages/${locale}/${slug}.mdx`)) as {
    default: ComponentType<{ locale: Locale }>;
  };
  return mod.default;
}
