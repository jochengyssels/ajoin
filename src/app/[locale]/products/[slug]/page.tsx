import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { catalogue } from "@/lib/catalogue";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { pub, site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { Gallery } from "@/components/product/gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateStaticParams() {
  const products = await catalogue.listProducts();
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await catalogue.getProduct(slug);
  if (!product) return {};
  const l = locale as Locale;
  return pageMetadata({
    locale: l,
    path: `/products/${slug}`,
    title: product.name[l],
    description: product.tagline[l],
    image: product.images[0].src,
  });
}

function Section({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line py-1">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <h2 className="font-sans text-base font-semibold">{title}</h2>
        <span aria-hidden="true" className="text-2xl leading-none text-onion transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-5 text-[0.98rem] leading-relaxed">{children}</div>
    </details>
  );
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const product = await catalogue.getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations({ locale, namespace: "product" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const plans = await catalogue.subscriptionPlans();
  const claims = product.claims.filter((c) => c.reviewed).map((c) => c.text[locale]);
  const faq = product.faq.filter((f) => pub(f.a[locale]));
  const hasDetails =
    product.variants.some((v) => pub(v.netContent)) ||
    product.paoMonths !== null ||
    Boolean(pub(product.warnings[locale])) ||
    Boolean(pub(site.responsiblePerson.name));
  const hasSections =
    hasDetails ||
    faq.length > 0 ||
    Boolean(pub(product.description[locale]) || pub(product.howToUse[locale]) || pub(product.inci));

  const url = absoluteUrl(locale, `/products/${slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name[locale],
      description: product.tagline[locale],
      image: product.images.map((i) => `${site.url}${i.src}`),
      brand: { "@type": "Brand", name: site.name },
      sku: product.variants[0].sku,
      url,
      offers: product.variants.filter((v) => !v.pricePlaceholder).map((v) => ({
        "@type": "Offer",
        sku: v.sku,
        price: (v.priceCents / 100).toFixed(2),
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url,
        itemCondition: "https://schema.org/NewCondition",
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: site.name, item: absoluteUrl(locale, "") },
        { "@type": "ListItem", position: 2, name: product.name[locale], item: url },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <Container className="py-6 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="underline underline-offset-2 hover:text-onion">
                {site.name}
              </Link>
              <span aria-hidden="true" className="ml-2">/</span>
            </li>
            <li aria-current="page">{product.name[locale]}</li>
          </ol>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-14">
          <Gallery images={product.images.map((i) => ({ ...i, alt: i.alt[locale] }))} />

          <div>
            <h1 className="text-4xl md:text-5xl">{product.name[locale]}</h1>
            <p className="mt-3 text-lg text-muted">{product.tagline[locale]}</p>
            {claims.length > 0 && (
              <ul className="mt-4 space-y-1">
                {claims.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span aria-hidden="true" className="text-skin-deep">◆</span>
                    {c}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8">
              <PurchasePanel product={product} plans={plans} />
            </div>

            <div className={hasSections ? "mt-10 border-t border-line" : "hidden"}>
              {pub(product.description[locale]) && (
                <Section title={t("description")} open>
                  <p>{product.description[locale]}</p>
                </Section>
              )}
              {pub(product.howToUse[locale]) && (
                <Section title={t("howToUse")}>
                  <p>{product.howToUse[locale]}</p>
                </Section>
              )}
              {pub(product.inci) && (
                <Section title={t("ingredients")}>
                  <p className="text-sm">{product.inci}</p>
                </Section>
              )}
              {hasDetails && (
              <Section title={t("details")}>
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                  {product.variants.some((v) => pub(v.netContent)) && (
                    <>
                      <dt className="font-semibold">{t("netContent")}</dt>
                      <dd>{product.variants.map((v) => pub(v.netContent)).filter(Boolean).join(" / ")}</dd>
                    </>
                  )}
                  {product.paoMonths !== null && (
                    <>
                      <dt className="font-semibold">PAO</dt>
                      <dd>{t("pao", { months: product.paoMonths })}</dd>
                    </>
                  )}
                  {pub(product.warnings[locale]) && (
                    <>
                      <dt className="font-semibold">{t("warnings")}</dt>
                      <dd>{product.warnings[locale]}</dd>
                    </>
                  )}
                  {pub(site.responsiblePerson.name) && (
                    <>
                      <dt className="font-semibold">{t("responsiblePerson")}</dt>
                      <dd>
                        {site.responsiblePerson.name}
                        <br />
                        {site.responsiblePerson.address}
                      </dd>
                    </>
                  )}
                </dl>
              </Section>
              )}
              {faq.length > 0 && (
                <Section title={t("faq")}>
                  <dl className="space-y-4">
                    {faq.map((f) => (
                      <div key={f.q[locale]}>
                        <dt className="font-semibold">{f.q[locale]}</dt>
                        <dd className="mt-1">{f.a[locale]}</dd>
                      </div>
                    ))}
                  </dl>
                </Section>
              )}
            </div>
          </div>
        </div>

      </Container>
    </>
  );
}
