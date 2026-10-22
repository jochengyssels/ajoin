import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { ClearCart } from "@/components/cart/clear-cart";
import { SimplePage } from "@/components/layout/simple-page";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { robots: { index: false } };

export default async function SuccessPage({ params }: PageProps<"/[locale]/checkout/success">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "checkout" });
  return (
    <SimplePage title={t("successTitle")} intro={t("successBody")}>
      <ClearCart />
      <ButtonLink href="/shop" variant="secondary">
        {t("continueShopping")}
      </ButtonLink>
    </SimplePage>
  );
}
