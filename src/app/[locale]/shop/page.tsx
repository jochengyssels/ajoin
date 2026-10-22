import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { SHAMPOO_SLUG } from "../../../../content/catalogue/products";

// One product, so "shop" is the product page. Kept so old or typed-in links still work.
export default async function ShopPage({ params }: PageProps<"/[locale]/shop">) {
  const { locale } = await params;
  redirect({ href: `/products/${SHAMPOO_SLUG}`, locale: locale as Locale });
}
