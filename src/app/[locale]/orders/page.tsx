import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { SimplePage } from "@/components/layout/simple-page";
import { ApiForm } from "@/components/forms/api-form";

export async function generateMetadata({ params }: PageProps<"/[locale]/orders">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orders" });
  return { ...pageMetadata({ locale: locale as Locale, path: "/orders", title: t("title") }), robots: { index: false } };
}

export default async function OrdersPage({ params, searchParams }: PageProps<"/[locale]/orders">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "orders" });
  const f = await getTranslations({ locale, namespace: "form" });
  const expired = (await searchParams).expired === "1";
  return (
    <SimplePage title={t("title")} intro={t("intro")}>
      {expired && <p className="mb-6 font-semibold text-danger">{t("linkExpired")}</p>}
      <ApiForm
        endpoint="/api/orders/lookup"
        fields={[
          { name: "email", label: t("email"), type: "email", required: true, autoComplete: "email" },
          { name: "number", label: t("number"), required: true, hint: t("numberHint"), upper: true },
        ]}
        submitLabel={t("submit")}
        pendingLabel={t("pending")}
        success={<p>{t("sent")}</p>}
        errorMessage={t("error")}
        requiredLabel={f("required")}
      />
    </SimplePage>
  );
}
