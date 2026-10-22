"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { ReactNode } from "react";

/**
 * Filter chips that live in the URL (?hair=…&type=…), so filtered views can be
 * shared and the back button works. Product cards are rendered on the server
 * and passed in keyed by slug; filtering only toggles their visibility.
 */
export function ShopFilters({
  items,
  hairTypes,
  productTypes,
}: {
  items: { slug: string; hairTypes: string[]; type: string; card: ReactNode }[];
  hairTypes: string[];
  productTypes: string[];
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const hair = params.get("hair");
  const type = params.get("type");

  const visible = items.filter((i) => (!hair || i.hairTypes.includes(hair)) && (!type || i.type === type));

  function set(key: "hair" | "type", value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-pill border px-4 text-sm font-medium transition-colors ${
      active ? "border-onion bg-onion text-flesh" : "border-line bg-white hover:border-onion"
    }`;

  const group = (label: string, key: "hair" | "type", values: string[], current: string | null, ns: string) => (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={chip(!current)} aria-pressed={!current} onClick={() => set(key, null)}>
          {t("all")}
        </button>
        {values.map((v) => (
          <button
            key={v}
            type="button"
            className={chip(current === v)}
            aria-pressed={current === v}
            onClick={() => set(key, current === v ? null : v)}
          >
            {t(`${ns}.${v}`)}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <>
      <div className="mt-8 grid gap-6 border-y border-line py-6 md:grid-cols-2" role="group" aria-label={t("filters")}>
        {group(t("hairType"), "hair", hairTypes, hair, "hairTypes")}
        {group(t("productType"), "type", productTypes, type, "productTypes")}
      </div>
      <p className="mt-6 text-sm text-muted" role="status">
        {t("results", { count: visible.length })}
      </p>
      {visible.length === 0 ? (
        <div className="py-16">
          <p>{t("empty")}</p>
          <button type="button" className="mt-4 font-semibold text-onion underline" onClick={() => router.replace(pathname)}>
            {t("clear")}
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((i) => (
            <li key={i.slug}>{i.card}</li>
          ))}
        </ul>
      )}
    </>
  );
}
