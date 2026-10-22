"use client";

import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { Container } from "@/components/ui/container";
import { LocaleSwitcher } from "./locale-switcher";
import { Wordmark } from "./wordmark";
import { SHAMPOO_SLUG } from "../../../content/catalogue/products";

const links = [
  { href: `/products/${SHAMPOO_SLUG}`, key: "product" },
  { href: "/ingredients", key: "ingredients" },
  { href: "/about", key: "about" },
  { href: "/blog", key: "blog" },
] as const;

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const { count, open, ready } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-flesh/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <button
          type="button"
          className="-ml-2 inline-flex size-11 items-center justify-center rounded-full md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">{menuOpen ? t("closeMenu") : t("openMenu")}</span>
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" stroke="currentColor" strokeWidth="1.8" fill="none">
            {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <Link href="/" aria-label={t("home")} className="inline-flex min-h-11 items-center">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="inline-flex min-h-11 items-center rounded-pill px-3 text-sm font-medium hover:bg-paper aria-[current=page]:text-onion aria-[current=page]:underline aria-[current=page]:decoration-skin aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Suspense>
            <LocaleSwitcher className="hidden lg:block" />
          </Suspense>
          <button
            type="button"
            onClick={open}
            className="relative -mr-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-paper"
            aria-label={t("cartCount", { count: ready ? count : 0 })}
            data-testid="cart-button"
          >
            <BagIcon />
            {ready && count > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0.5 top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-onion px-1 text-xs font-bold text-flesh"
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-line bg-flesh md:hidden">
          <Container className="py-4">
            <nav aria-label="Main">
              <ul className="flex flex-col">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-12 items-center font-display text-xl aria-[current=page]:text-onion"
                    >
                      {t(l.key)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/faq" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center font-display text-xl">
                    {t("faq")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center font-display text-xl">
                    {t("contact")}
                  </Link>
                </li>
              </ul>
            </nav>
            <Suspense>
              <LocaleSwitcher className="mt-4" />
            </Suspense>
          </Container>
        </div>
      )}
    </header>
  );
}
