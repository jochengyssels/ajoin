"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";
import type { Locale } from "@/i18n/routing";
import type { Product, SubscriptionPlan } from "@/lib/catalogue/types";
import { subscriptionUnitPrice } from "@/lib/cart/pricing";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart/cart-provider";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";

export function PurchasePanel({ product, plans }: { product: Product; plans: SubscriptionPlan[] }) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const { add } = useCart();
  const id = useId();
  const [sku, setSku] = useState(product.variants[0].sku);
  const [mode, setMode] = useState<"once" | "subscribe">("once");
  const [interval, setIntervalWeeks] = useState(plans[0]?.intervalWeeks);
  const [qty, setQty] = useState(1);

  const variant = product.variants.find((v) => v.sku === sku)!;
  const canSubscribe = variant.subscribable && plans.length > 0;
  const subscribing = canSubscribe && mode === "subscribe";
  const plan = plans.find((p) => p.intervalWeeks === interval) ?? plans[0];
  const unit = subscribing ? subscriptionUnitPrice(variant.priceCents, plan.discountPercent) : variant.priceCents;
  const maxDiscount = Math.max(0, ...plans.map((p) => p.discountPercent));

  const option = (checked: boolean) =>
    `flex min-h-12 cursor-pointer items-center gap-3 rounded-soft border-2 px-4 py-3 ${
      checked ? "border-onion bg-white" : "border-line bg-white/60 hover:border-onion/60"
    }`;

  // No real price yet: show nothing invented, and don't let it into the cart.
  if (variant.pricePlaceholder) {
    return (
      <p className="inline-flex min-h-12 items-center rounded-pill bg-paper px-6 font-semibold" data-testid="coming-soon">
        {t("comingSoon")}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        add({ kind: "variant", sku, qty, ...(subscribing ? { intervalWeeks: plan.intervalWeeks } : {}) });
      }}
      className="space-y-6"
    >
      <div>
        <p className="text-3xl font-semibold tabular-nums">
          <Price cents={unit} locale={locale} compareCents={subscribing ? variant.priceCents : undefined} />
        </p>
        <p className="text-sm text-muted">{t("inclVat")}</p>
        {variant.lowestPrice30dCents !== undefined && (
          <p className="text-sm text-muted">{t("lowestPrice", { price: formatPrice(variant.lowestPrice30dCents, locale) })}</p>
        )}
      </div>

      {product.variants.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t("size")}</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <label key={v.sku} className={`${option(v.sku === sku)} min-w-24 justify-center`}>
                <input
                  type="radio"
                  name={`${id}-size`}
                  value={v.sku}
                  checked={v.sku === sku}
                  onChange={() => setSku(v.sku)}
                  className="sr-only"
                />
                <span className="font-semibold">{v.size[locale]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {canSubscribe && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t("purchase")}</legend>
          <div className="grid gap-2">
            <label className={option(mode === "once")}>
              <input
                type="radio"
                name={`${id}-mode`}
                checked={mode === "once"}
                onChange={() => setMode("once")}
                className="size-5 accent-[var(--color-onion)]"
              />
              <span className="flex-1">{t("oneTime")}</span>
              <span className="tabular-nums">{formatPrice(variant.priceCents, locale)}</span>
            </label>
            <label className={option(mode === "subscribe")}>
              <input
                type="radio"
                name={`${id}-mode`}
                checked={mode === "subscribe"}
                onChange={() => setMode("subscribe")}
                className="size-5 accent-[var(--color-onion)]"
              />
              <span className="flex-1">{t("subscribe", { percent: maxDiscount })}</span>
              <span className="tabular-nums">
                {formatPrice(subscriptionUnitPrice(variant.priceCents, plan.discountPercent), locale)}
              </span>
            </label>
          </div>
          {subscribing && plans.length > 1 && (
            <div className="mt-3">
              <label htmlFor={`${id}-interval`} className="mb-1 block text-sm font-semibold">
                {t("interval")}
              </label>
              <select
                id={`${id}-interval`}
                value={interval}
                onChange={(e) => setIntervalWeeks(Number(e.target.value))}
                className="min-h-12 w-full rounded-soft border-2 border-line bg-white px-3"
              >
                {plans.map((p) => (
                  <option key={p.intervalWeeks} value={p.intervalWeeks}>
                    {t("weeks", { weeks: p.intervalWeeks })}
                  </option>
                ))}
              </select>
            </div>
          )}
          {subscribing && <p className="mt-2 text-sm text-muted">{t("subscribeNote")}</p>}
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} label={t("quantity")} min={1} />
        <Button type="submit" className="flex-1" data-testid="add-to-cart">
          {t("addToCart")}
        </Button>
      </div>
    </form>
  );
}
