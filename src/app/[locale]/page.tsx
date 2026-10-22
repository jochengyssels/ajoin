import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { catalogue } from "@/lib/catalogue";
import { formatPrice } from "@/lib/format";
import { pub } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { OnionRings } from "@/components/ui/onion-rings";
import { Harlequin } from "@/components/ui/harlequin";
import { Ajuinworp } from "@/components/ui/ajuinworp";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: l } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const nl = await getTranslations({ locale, namespace: "newsletter" });

  const [product] = await catalogue.listProducts();
  const variant = product.variants[0];
  const howToUse = pub(product.howToUse[locale]);

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
              <ButtonLink href={`/products/${product.slug}`} className="bg-skin text-ink hover:bg-paper">
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

      {/* The product */}
      <section aria-labelledby="product-title" className="bg-paper/60 py-16 md:py-24">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt[locale]}
            width={product.images[0].width}
            height={product.images[0].height}
            sizes="(min-width: 768px) 45vw, 90vw"
            className="aspect-[4/5] w-full max-w-md rounded-card object-cover md:justify-self-end"
          />
          <div>
            <h2 id="product-title" className="text-3xl md:text-4xl">
              {t("productTitle")}
            </h2>
            <p className="mt-4 text-xl">{product.name[locale]}</p>
            <p className="mt-2 max-w-sm text-muted">{product.tagline[locale]}</p>
            {variant && !variant.pricePlaceholder && (
              <p className="mt-4 text-lg font-semibold tabular-nums">{formatPrice(variant.priceCents, locale)}</p>
            )}
            <ButtonLink href={`/products/${product.slug}`} className="mt-6">
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
            <ButtonLink href="/science" variant="ghost" className="mt-6">
              {t("whyCta")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* How to use: the brand's own text, shown once it exists. */}
      {howToUse && (
        <section aria-labelledby="how-title" className="bg-onion-dark py-16 text-flesh md:py-24">
          <Container className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
            <h2 id="how-title" className="text-3xl md:text-4xl">
              {t("howTitle")}
            </h2>
            <p className="max-w-[60ch] text-lg">{howToUse}</p>
          </Container>
        </section>
      )}

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
