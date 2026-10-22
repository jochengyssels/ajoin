"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

export function AddBundleButton({ slug }: { slug: string }) {
  const t = useTranslations("bundles");
  const { add } = useCart();
  return (
    <Button type="button" onClick={() => add({ kind: "bundle", slug, qty: 1 })} className="w-full sm:w-auto">
      {t("add")}
    </Button>
  );
}
