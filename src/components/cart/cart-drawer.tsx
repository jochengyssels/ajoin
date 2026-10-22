"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { freeShippingProgress, shippingCostCents } from "@/lib/cart/pricing";
import { shippingRates, type ShippingCountry } from "../../../content/shipping";
import { formatPrice } from "@/lib/format";
import { Button, buttonClass } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { useCart } from "./cart-provider";
import { QuantityStepper } from "./quantity-stepper";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { isOpen, close, priced, update, remove, cart, freeShippingThresholdCents } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tc = useTranslations("countries");
  const defaultCountry: ShippingCountry = locale === "fr" ? "FR" : locale === "it" ? "IT" : "BE";
  const [country, setCountry] = useState<ShippingCountry>(defaultCountry);
  const rate = shippingRates.find((r) => r.country === country) ?? shippingRates[0];

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const ship = freeShippingProgress(priced.subtotalCents, freeShippingThresholdCents);
  const shippingCents = shippingCostCents(priced.subtotalCents, rate.amountCents, freeShippingThresholdCents);

  async function checkout() {
    setCheckingOut(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, locale, country }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "checkout_failed");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error && e.message === "mixed_intervals" ? t("mixedIntervals") : t("checkoutError"));
      setCheckingOut(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="cart-title"
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md bg-flesh p-0 text-ink shadow-2xl backdrop:bg-ink/40 open:animate-drawer-in"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-title" className="text-2xl">
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={close}
            className="inline-flex size-11 items-center justify-center rounded-full hover:bg-paper"
            aria-label={t("close")}
          >
            <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {priced.lines.length > 0 && (
          <div className="border-b border-line px-5 py-3" aria-live="polite">
            <p className="text-sm">
              {ship.qualifies
                ? t("freeShippingReached")
                : t("freeShippingRemaining", { amount: formatPrice(ship.remainingCents, locale) })}
            </p>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-paper"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(ship.progress * 100)}
              aria-label={t("freeShippingReached")}
            >
              <div className="h-full rounded-full bg-onion transition-[width]" style={{ width: `${ship.progress * 100}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {priced.lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="mb-6 text-muted">{t("empty")}</p>
              <Link href="/shop" onClick={close} className={buttonClass("secondary")}>
                {t("emptyCta")}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {priced.lines.map((l) => {
                const name = l.bundle ? l.bundle.name[locale] : l.product!.name[locale];
                const image = l.bundle ? l.bundle.image : l.product!.images[0];
                return (
                  <li key={l.key} className="flex gap-4 py-5">
                    <Image
                      src={image.src}
                      alt=""
                      width={80}
                      height={100}
                      className="h-25 w-20 shrink-0 rounded-soft object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="font-semibold leading-snug">{name}</p>
                      <p className="text-sm text-muted">
                        {l.bundle ? t("bundle") : l.variant!.size[locale]}
                        {l.recurring && (
                          <>
                            <br />
                            {t("every", { weeks: l.recurring.intervalWeeks, percent: l.recurring.discountPercent })}
                          </>
                        )}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <QuantityStepper
                          value={l.line.qty}
                          onChange={(q) => update(l.key, q)}
                          label={t("quantityOf", { name })}
                          small
                        />
                        <Price cents={l.totalCents} locale={locale} className="font-semibold" />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(l.key)}
                        aria-label={t("remove", { name })}
                        className="inline-flex min-h-11 items-center self-start text-sm text-muted underline underline-offset-2 hover:text-onion"
                      >
                        {t("removeShort")}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {priced.lines.length > 0 && (
          <div className="border-t border-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="ship-country" className="text-sm font-semibold">
                {t("shipTo")}
              </label>
              <select
                id="ship-country"
                value={country}
                onChange={(e) => setCountry(e.target.value as ShippingCountry)}
                className="min-h-11 rounded-soft border border-line bg-white px-3 text-sm"
              >
                {shippingRates.map((r) => (
                  <option key={r.country} value={r.country}>
                    {tc(r.country)}
                  </option>
                ))}
              </select>
            </div>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt>{t("subtotal")}</dt>
                <dd className="tabular-nums">{formatPrice(priced.subtotalCents, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("shippingCost")}</dt>
                <dd className="tabular-nums">{shippingCents === 0 ? t("shippingFree") : formatPrice(shippingCents, locale)}</dd>
              </div>
              <div className="flex items-baseline justify-between pt-1 text-base font-semibold">
                <dt>{t("total")}</dt>
                <dd className="text-xl tabular-nums">{formatPrice(priced.subtotalCents + shippingCents, locale)}</dd>
              </div>
            </dl>
            <p className="mt-1 text-xs text-muted">{t("subtotalNote")}</p>
            {error && (
              <p role="alert" className="mt-3 text-sm text-danger">
                {error}
              </p>
            )}
            <Button onClick={checkout} disabled={checkingOut} className="mt-4 w-full" data-testid="checkout-button">
              {checkingOut ? t("checkingOut") : t("checkout")}
            </Button>
          </div>
        )}
      </div>
    </dialog>
  );
}
