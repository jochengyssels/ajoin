import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { routing, type Locale } from "@/i18n/routing";
import { catalogue } from "@/lib/catalogue";
import { catalogueHasPlaceholders } from "@/lib/catalogue/readiness";
import { isShowcase } from "@/lib/showcase";
import { alternates } from "@/lib/seo";
import { site } from "@/lib/site";
import { freeShippingThresholdCents } from "../../../content/shipping";
import { figtree, gloock } from "../fonts";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Consent } from "@/components/consent/consent";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("title"), template: `%s | ${t("siteName")}` },
    description: t("description"),
    alternates: alternates(locale, ""),
    openGraph: { siteName: site.name, locale, type: "website" },
    // Keep the test shop out of search engines until it sells for real.
    robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#fdf7ec",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "nav" });
  const sample = await getTranslations({ locale });
  const [products, bundles, plans] = await Promise.all([
    catalogue.listProducts(),
    catalogue.listBundles(),
    catalogue.subscriptionPlans(),
  ]);

  return (
    <html lang={locale as Locale} className={`${gloock.variable} ${figtree.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-pill focus:bg-onion focus:px-4 focus:py-2 focus:text-flesh"
        >
          {t("skip")}
        </a>
        <NextIntlClientProvider>
          <CartProvider snapshot={{ products, bundles, plans }} freeShippingThresholdCents={freeShippingThresholdCents}>
            {(isShowcase() || catalogueHasPlaceholders()) && (
              <p className="bg-paper px-4 py-2 text-center text-xs font-medium text-ink">{sample("sample")}</p>
            )}
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <Consent />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
