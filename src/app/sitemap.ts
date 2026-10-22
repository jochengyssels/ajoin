import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { catalogue } from "@/lib/catalogue";
import { contentPages } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import { posts } from "../../content/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await catalogue.listProducts();
  const paths = [
    "",
    "/blog",
    "/contact",
    "/withdrawal",
    ...Object.keys(contentPages).map((p) => `/${p}`),
    ...products.map((p) => `/products/${p.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
  ];
  return paths.map((path) => ({
    url: absoluteUrl(routing.defaultLocale, path),
    changeFrequency: path.startsWith("/products") || path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/products") ? 0.9 : 0.5,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(l, path)])),
    },
  }));
}
