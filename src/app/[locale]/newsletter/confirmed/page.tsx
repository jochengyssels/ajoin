import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SimplePage } from "@/components/layout/simple-page";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export const metadata: Metadata = { robots: { index: false } };

export default async function ConfirmedPage({ params, searchParams }: PageProps<"/[locale]/newsletter/confirmed">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "newsletter" });
  const invalid = (await searchParams).invalid === "1";
  return invalid ? (
    <SimplePage title={t("invalidTitle")} intro={t("invalidBody")}>
      <NewsletterForm />
    </SimplePage>
  ) : (
    <SimplePage title={t("confirmedTitle")} intro={t("confirmedBody")} />
  );
}
