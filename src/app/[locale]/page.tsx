import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { catalogue } from "@/lib/catalogue";
import { formatPrice } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { OnionRings } from "@/components/ui/onion-rings";
import { Harlequin } from "@/components/ui/harlequin";
import { Ajuinworp } from "@/components/ui/ajuinworp";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: l } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const nl = await getTranslations({ locale, namespace: "newsletter" });
  const ts = await getTranslations({ locale, namespace: "shop" });

  const products = await catalogue.listProducts();
  const bestseller = products.find((p) => p.bestseller) ?? products[0];
  const steps = ["one", "two", "three"] as const;

  return (
    <>
      {/* Hero: carnival night over the Grote Markt, with the ajuinworp falling once. */}
      <section className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_70%_30%,var(--color-onion)_0%,var(--color-onion-dark)_45%,var(--color-ink)_100%)] text-flesh">
        <Ajuinworp />
        <Container className="relative grid items-center gap-6 pb-14 pt-6 md:grid-cols-[1.15fr_1fr] md:pb-24 md:pt-14">
          <div className="order-2 md:order-1">
            <h1 className="sign-type text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[5.25rem]">{t("heroTitle")}</h1>
            <p className="mt-6 max-w-md text-lg text-flesh/85">{t("heroBody")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href={`/products/${bestseller.slug}`} className="bg-skin text-ink hover:bg-paper">
                {t("heroCta")}
              </ButtonLink>
              <ButtonLink href="/ingredients" variant="ghost" className="text-paper decoration-skin hover:decoration-paper">
                {t("heroSecondary")}
              </ButtonLink>
            </div>
          </div>
          <div className="relative order-1 mx-auto w-full max-w-[14rem] md:order-2 md:max-w-[34rem]">
            <OnionRings
              className="absolute inset-[-14%] h-[128%] w-[128%]"
              colors={["var(--color-skin)", "var(--color-paper)"]}
              opacity={[0.5, 0.18]}
            />
            <Image
              src="/brand/ajoin-badge-720.webp"
              alt="Ajoin & Shine"
              width={720}
              height={718}
              priority
              fetchPriority="high"
              sizes="(min-width: 768px) 34rem, 14rem"
              className="relative drop-shadow-[0_30px_50px_rgba(0,0,0,0.45)]"
            />
          </div>
        </Container>
        <Harlequin />
      </section>

      {/* Bestseller */}
      <section aria-labelledby="bestseller-title" className="bg-paper/60 py-16 md:py-24">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <Image
            src={bestseller.images[0].src}
            alt={bestseller.images[0].alt[locale]}
            width={bestseller.images[0].width}
            height={bestseller.images[0].height}
            sizes="(min-width: 768px) 45vw, 90vw"
            className="aspect-[4/5] w-full max-w-md rounded-card object-cover md:justify-self-end"
          />
          <div>
            <h2 id="bestseller-title" className="text-3xl md:text-4xl">
              {t("bestsellerTitle")}
            </h2>
            <p className="mt-4 text-xl">{bestseller.name[locale]}</p>
            <p className="mt-2 max-w-sm text-muted">{bestseller.tagline[locale]}</p>
            <p className="mt-4 text-lg font-semibold tabular-nums">
              {formatPrice(Math.min(...bestseller.variants.map((v) => v.priceCents)), locale)}
            </p>
            <ButtonLink href={`/products/${bestseller.slug}`} className="mt-6">
              {t("bestsellerCta")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Why onion */}
      <section aria-labelledby="why-title" className="py-16 md:py-24">
        <Container className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <h2 id="why-title" className="text-3xl md:text-5xl">
            {t("whyTitle")}
          </h2>
          <div>
            <p className="max-w-[60ch] text-lg">{t("whyBody")}</p>
            <ButtonLink href="/ingredients" variant="ghost" className="mt-6">
              {t("whyCta")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* How to use: a real sequence, so it is numbered. */}
      <section aria-labelledby="how-title" className="bg-onion-dark py-16 text-flesh md:py-24">
        <Container>
          <h2 id="how-title" className="text-3xl md:text-4xl">
            {t("howTitle")}
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s} className="border-t border-skin/60 pt-5">
                <span className="font-display text-4xl text-skin" aria-hidden="true">
                  {i + 1}
                </span>
                <p className="mt-3 max-w-xs">{t(`howSteps.${s}`)}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Shop row */}
      <section aria-labelledby="range-title" className="py-16 md:py-24">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 id="range-title" className="text-3xl md:text-4xl">
              {ts("title")}
            </h2>
            <ButtonLink href="/bundles" variant="ghost">
              {t("bundlesCta")}
            </ButtonLink>
          </div>
          <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} locale={locale} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Social proof: empty until there are real reviews. */}
      <section aria-labelledby="reviews-title" className="border-y border-line py-14">
        <Container>
          <h2 id="reviews-title" className="text-2xl">
            {t("socialTitle")}
          </h2>
          <p className="mt-3 text-muted">{t("socialEmpty")}</p>
        </Container>
      </section>

      {/* Newsletter */}
      <section aria-labelledby="newsletter-title" className="py-16 md:py-24">
        <Container className="grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <h2 id="newsletter-title" className="text-3xl md:text-4xl">
              {nl("title")}
            </h2>
            <p className="mt-3 max-w-sm text-muted">{nl("body")}</p>
          </div>
          <NewsletterForm />
        </Container>
      </section>
    </>
  );
}
