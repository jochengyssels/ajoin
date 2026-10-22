import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { ConsentSettingsButton } from "@/components/consent/consent";
import { Wordmark } from "./wordmark";
import { Harlequin } from "@/components/ui/harlequin";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  const groups = [
    {
      title: t("shop"),
      links: [
        { href: "/shop", label: nav("shop") },
        { href: "/bundles", label: nav("bundles") },
        { href: "/ingredients", label: nav("ingredients") },
        { href: "/about", label: nav("about") },
        { href: "/blog", label: nav("blog") },
      ],
    },
    {
      title: t("help"),
      links: [
        { href: "/faq", label: nav("faq") },
        { href: "/contact", label: nav("contact") },
        { href: "/orders", label: t("orders") },
        { href: "/shipping", label: t("shipping") },
        { href: "/withdrawal", label: t("withdrawal") },
      ],
    },
    {
      title: t("legal"),
      links: [
        { href: "/terms", label: t("terms") },
        { href: "/privacy", label: t("privacy") },
        { href: "/legal-notice", label: t("notice") },
      ],
    },
  ];

  return (
    <footer className="mt-24 bg-onion-dark text-flesh">
      <Harlequin />
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark onDark />
          <p className="mt-3 max-w-xs text-sm text-flesh/80">{t("tagline")}</p>
          <p className="mt-6 text-sm text-flesh/80">{t("vat")}</p>
        </div>
        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="font-sans text-sm font-semibold text-paper">{g.title}</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-9 items-center hover:text-paper hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
              {g.title === t("legal") && (
                <li className="inline-flex min-h-9 items-center">
                  <ConsentSettingsButton label={t("cookies")} />
                </li>
              )}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-flesh/15">
        <Container className="flex flex-col gap-1 py-5 text-xs text-flesh/75 sm:flex-row sm:justify-between">
          <span>{t("rights", { year: new Date().getFullYear(), company: site.company.name })}</span>
          <span>
            VAT {site.company.vat} · {site.company.enterpriseNumber}
          </span>
        </Container>
      </div>
    </footer>
  );
}
