import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { contentPages, isContentSlug, loadContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => Object.keys(contentPages).map((page) => ({ locale, page })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/[page]">): Promise<Metadata> {
  const { locale, page } = await params;
  if (!isContentSlug(page)) return {};
  const t = await getTranslations({ locale, namespace: "pages" });
  return pageMetadata({ locale: locale as Locale, path: `/${page}`, title: t(contentPages[page].titleKey) });
}

export default async function ContentPage({ params }: PageProps<"/[locale]/[page]">) {
  const { locale: l, page } = await params;
  const locale = l as Locale;
  if (!isContentSlug(page)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages" });
  const Content = await loadContent(locale, page);

  return (
    <Container className="py-12 md:py-16">
      {contentPages[page].legal && (
        <p className="mb-8 max-w-[68ch] rounded-soft bg-paper px-4 py-3 text-sm font-medium">{t("draftNotice")}</p>
      )}
      <article className="prose-ajoin">
        <Content locale={locale} />
      </article>
    </Container>
  );
}
