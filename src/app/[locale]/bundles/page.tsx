import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { catalogue } from "@/lib/catalogue";
import { findVariant } from "@/lib/cart/pricing";
import { formatPrice } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { Price } from "@/components/ui/price";
import { AddBundleButton } from "@/components/product/add-bundle";

export async function generateMetadata({ params }: PageProps<"/[locale]/bundles">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bundles" });
  return pageMetadata({ locale: locale as Locale, path: "/bundles", title: t("title"), description: t("intro") });
}

export default async function BundlesPage({ params }: PageProps<"/[locale]/bundles">) {
  const { locale: l } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "bundles" });
  const [bundles, products] = await Promise.all([catalogue.listBundles(), catalogue.listProducts()]);

  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t("intro")}</p>
      <ul className="mt-12 space-y-16">
        {bundles.map((b) => {
          const items = b.skus.map((sku) => findVariant(products, sku)).filter((x) => x !== undefined);
          const separate = items.reduce((s, i) => s + i.variant.priceCents, 0);
          const saving = separate - b.priceCents;
          return (
            <li key={b.slug} className="grid items-center gap-8 md:grid-cols-2">
              <Image
                src={b.image.src}
                alt={b.image.alt[locale]}
                width={b.image.width}
                height={b.image.height}
                sizes="(min-width: 768px) 45vw, 90vw"
                className="aspect-[4/5] w-full max-w-md rounded-card object-cover"
              />
              <div>
                <h2 className="text-3xl">{b.name[locale]}</h2>
                <p className="mt-2 text-muted">{b.description[locale]}</p>
                <h3 className="mt-6 text-sm font-semibold font-sans">{t("includes")}</h3>
                <ul className="mt-2 space-y-1">
                  {items.map((i) => (
                    <li key={i.variant.sku}>
                      {i.product.name[locale]}, {i.variant.size[locale]}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 flex items-baseline gap-3 text-2xl font-semibold">
                  <Price cents={b.priceCents} locale={locale} compareCents={separate} />
                  {saving > 0 && (
                    <span className="rounded-pill bg-paper px-3 py-1 text-sm text-ink">
                      {t("save", { amount: formatPrice(saving, locale) })}
                    </span>
                  )}
                </p>
                <div className="mt-6">
                  <AddBundleButton slug={b.slug} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
