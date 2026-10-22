import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { posts } from "../../../../../content/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  const l = locale as Locale;
  return pageMetadata({ locale: l, path: `/blog/${slug}`, title: post.title[l], description: post.excerpt[l] });
}

export default async function BlogPost({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const Body = ((await import(`../../../../../content/blog/${locale}/${slug}.mdx`)) as { default: ComponentType })
    .default;
  return (
    <Container className="py-12 md:py-16">
      <Link href="/blog" className="text-sm underline underline-offset-2">
        {t("back")}
      </Link>
      <article className="prose-ajoin mt-6">
        <time dateTime={post.date} className="text-sm text-muted">
          {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(post.date))}
        </time>
        <h1 className="mt-2">{post.title[locale]}</h1>
        <Body />
      </article>
    </Container>
  );
}
