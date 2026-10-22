"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";

const labels: Record<string, string> = { en: "English", fr: "Français", nl: "Nederlands", it: "Italiano" };

export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const href = search ? `${pathname}?${search}` : pathname;

  return (
    <nav aria-label={t("language")} className={className}>
      <ul className="flex gap-1 text-sm">
        {locales.map((l) => (
          <li key={l}>
            <Link
              href={href}
              locale={l}
              hrefLang={l}
              lang={l}
              aria-current={l === locale ? "true" : undefined}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-2 uppercase ${
                l === locale ? "bg-onion text-flesh" : "text-ink hover:bg-paper"
              }`}
            >
              <abbr title={labels[l]} className="no-underline">{l}</abbr>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
