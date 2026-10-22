import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SimplePage } from "@/components/layout/simple-page";
import { OpenCartButton } from "@/components/cart/open-cart-button";

export const metadata: Metadata = { robots: { index: false } };

export default async function CancelPage({ params }: PageProps<"/[locale]/checkout/cancel">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "checkout" });
  return (
    <SimplePage title={t("cancelTitle")} intro={t("cancelBody")}>
      <OpenCartButton label={t("backToCart")} />
    </SimplePage>
  );
}
