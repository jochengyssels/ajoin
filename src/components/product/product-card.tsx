import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/lib/catalogue/types";
import { formatPrice } from "@/lib/format";

export async function ProductCard({ product, locale, priority = false }: { product: Product; locale: Locale; priority?: boolean }) {
  const t = await getTranslations({ locale, namespace: "shop" });
  const from = Math.min(...product.variants.map((v) => v.priceCents));
  const img = product.images[0];
  return (
    <article className="group relative flex flex-col">
      <div className="overflow-hidden rounded-card bg-paper">
        <Image
          src={img.src}
          alt={img.alt[locale]}
          width={img.width}
          height={img.height}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          priority={priority}
          className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <h3 className="mt-4 text-xl">
        <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {product.name[locale]}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted">{product.tagline[locale]}</p>
      <p className="mt-2 font-semibold tabular-nums">
        {product.variants.length > 1 ? t("from", { price: formatPrice(from, locale) }) : formatPrice(from, locale)}
      </p>
    </article>
  );
}
