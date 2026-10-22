import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { SimplePage } from "@/components/layout/simple-page";
import { ApiForm } from "@/components/forms/api-form";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({ locale: locale as Locale, path: "/contact", title: t("title"), description: t("intro") });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const f = await getTranslations({ locale, namespace: "form" });
  return (
    <SimplePage title={t("title")} intro={t("intro")}>
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
        <ApiForm
          endpoint="/api/contact"
          fields={[
            { name: "name", label: t("name"), required: true, autoComplete: "name" },
            { name: "email", label: t("email"), type: "email", required: true, autoComplete: "email" },
            { name: "orderNumber", label: t("orderNumber"), upper: true },
            { name: "message", label: t("message"), type: "textarea", required: true },
          ]}
          submitLabel={t("submit")}
          pendingLabel={t("pending")}
          success={<p>{t("sent")}</p>}
          errorMessage={t("error")}
          requiredLabel={f("required")}
        />
        <address className="not-italic text-sm leading-relaxed">
          <strong>{site.company.name}</strong>
          <br />
          {site.company.address}
          <br />
          {site.company.email}
        </address>
      </div>
    </SimplePage>
  );
}
