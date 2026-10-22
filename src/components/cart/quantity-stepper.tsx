"use client";

import { useTranslations } from "next-intl";
import { MAX_QTY } from "@/lib/cart/types";

export function QuantityStepper({
  value,
  onChange,
  label,
  min = 0,
  small = false,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  min?: number;
  small?: boolean;
}) {
  const t = useTranslations("product");
  const size = small ? "size-11" : "size-12";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-pill border border-line bg-flesh">
      <button
        type="button"
        className={`${size} inline-flex items-center justify-center rounded-full text-lg hover:bg-paper disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={t("decrease")}
      >
        −
      </button>
      <output aria-live="polite" className="w-7 text-center tabular-nums font-semibold">
        {value}
      </output>
      <button
        type="button"
        className={`${size} inline-flex items-center justify-center rounded-full text-lg hover:bg-paper disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={t("increase")}
      >
        +
      </button>
    </div>
  );
}
