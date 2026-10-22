import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/routing";
import { site } from "./site";

/** Absolute URL for a locale-less path such as "/shop". */
export function absoluteUrl(locale: Locale, path = "") {
  const clean = path === "/" ? "" : path;
  return `${site.url}/${locale}${clean}`;
}

/** Canonical + hreflang alternates for a page that exists in every locale. */
export function alternates(locale: Locale, path = ""): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = absoluteUrl(l, path);
  languages["x-default"] = absoluteUrl("en", path);
  return { canonical: absoluteUrl(locale, path), languages };
}

export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
}: {
  locale: Locale;
  path: string;
  title: string;
  description?: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: alternates(locale, path),
    openGraph: {
      title,
      description,
      url: absoluteUrl(locale, path),
      siteName: site.name,
      locale,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}
