import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "@/i18n/routing";
import { catalogue } from "@/lib/catalogue";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product/product-card";
import { ShopFilters } from "@/components/product/shop-filters";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return pageMetadata({ locale: locale as Locale, path: "/shop", title: t("title"), description: t("intro") });
}

export default async function ShopPage({ params }: PageProps<"/[locale]/shop">) {
  const { locale: l } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "shop" });
  const products = await catalogue.listProducts();

  // Only offer filters that match at least one product.
  const hairTypes = [...new Set(products.flatMap((p) => p.hairTypes))];
  const productTypes = [...new Set(products.map((p) => p.type))];
  const items = products.map((p, i) => ({
    slug: p.slug,
    hairTypes: p.hairTypes,
    type: p.type,
    card: <ProductCard product={p} locale={locale} priority={i < 2} />,
  }));

  const grid = (
    <ul className="mt-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <li key={i.slug}>{i.card}</li>
      ))}
    </ul>
  );

  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t("intro")}</p>
      <Suspense fallback={grid}>
        <ShopFilters items={items} hairTypes={hairTypes} productTypes={productTypes} />
      </Suspense>
    </Container>
  );
}
