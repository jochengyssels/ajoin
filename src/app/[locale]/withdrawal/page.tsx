import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { SimplePage } from "@/components/layout/simple-page";
import { ApiForm } from "@/components/forms/api-form";

export async function generateMetadata({ params }: PageProps<"/[locale]/withdrawal">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "withdrawal" });
  return pageMetadata({ locale: locale as Locale, path: "/withdrawal", title: t("title") });
}

export default async function WithdrawalPage({ params }: PageProps<"/[locale]/withdrawal">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "withdrawal" });
  const f = await getTranslations({ locale, namespace: "form" });
  return (
    <SimplePage title={t("title")} intro={t("intro")}>
      <ApiForm
        endpoint="/api/withdrawal"
        fields={[
          { name: "name", label: t("name"), required: true, autoComplete: "name" },
          { name: "email", label: t("email"), type: "email", required: true, autoComplete: "email" },
          { name: "number", label: t("number"), required: true, upper: true },
          { name: "reason", label: t("reason"), type: "textarea" },
          { name: "confirm", label: t("confirmLabel"), type: "checkbox", required: true },
        ]}
        submitLabel={t("submit")}
        pendingLabel={t("pending")}
        success={
          <>
            <h2 className="text-2xl">{t("doneTitle")}</h2>
            <p className="mt-2">{t("doneBody")}</p>
          </>
        }
        errorMessage={t("error")}
        errorMessages={{ not_found: t("notFound") }}
        requiredLabel={f("required")}
      />
      <p className="mt-10 max-w-lg text-sm">
        <a href={`/legal/withdrawal-form-${locale}.pdf`} className="underline underline-offset-2">
          {t("formLink")}
        </a>
      </p>
    </SimplePage>
  );
}
