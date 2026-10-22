import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Until the shop sells for real, keep crawlers out entirely.
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/*/checkout/", "/*/orders/view"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
