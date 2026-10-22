import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { posts } from "../../../../content/blog";

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return pageMetadata({ locale: locale as Locale, path: "/blog", title: t("title"), description: t("intro") });
}

export default async function BlogIndex({ params }: PageProps<"/[locale]/blog">) {
  const { locale: l } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t("intro")}</p>
      {posts.length === 0 ? (
        <p className="mt-10">{t("empty")}</p>
      ) : (
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {posts.map((p) => (
            <li key={p.slug} className="relative py-8">
              <time dateTime={p.date} className="text-sm text-muted">
                {fmt.format(new Date(p.date))}
              </time>
              <h2 className="mt-2 text-3xl">
                <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 hover:text-onion">
                  {p.title[locale]}
                </Link>
              </h2>
              <p className="mt-2 max-w-xl text-muted">{p.excerpt[locale]}</p>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
