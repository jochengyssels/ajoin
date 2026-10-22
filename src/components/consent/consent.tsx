"use client";

import Script from "next/script";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const COOKIE = "ajoin_consent";
const OPEN_EVENT = "ajoin:open-consent";
type Choice = "analytics" | "essential";

function readChoice(): Choice | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  const v = m?.[1];
  return v === "analytics" || v === "essential" ? v : null;
}

function writeChoice(choice: Choice) {
  const maxAge = 60 * 60 * 24 * 180; // ask again after six months
  document.cookie = `${COOKIE}=${choice}; Max-Age=${maxAge}; Path=/; SameSite=Lax${
    location.protocol === "https:" ? "; Secure" : ""
  }`;
}

/** Opens the consent banner again, e.g. from the footer's "Cookie settings". */
export function openConsent() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function ConsentSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={openConsent} className="text-left hover:text-paper hover:underline">
      {label}
    </button>
  );
}

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export function Consent() {
  const t = useTranslations("consent");
  const [choice, setChoice] = useState<Choice | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const c = readChoice();
    setChoice(c);
    setVisible(c === null);
    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  function decide(c: Choice) {
    writeChoice(c);
    const revoked = choice === "analytics" && c === "essential";
    setChoice(c);
    setVisible(false);
    // Scripts already loaded can't be unloaded; a reload guarantees they stop.
    if (revoked) location.reload();
  }

  const analyticsAllowed = choice === "analytics";

  return (
    <>
      {analyticsAllowed && plausibleDomain && (
        <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
      )}
      {analyticsAllowed && !plausibleDomain && gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {visible && (
        <section
          aria-labelledby="consent-title"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-card border border-line bg-flesh p-4 shadow-xl sm:p-5 sm:inset-x-6 sm:bottom-6"
        >
          <h2 id="consent-title" className="text-lg sm:text-xl">
            {t("title")}
          </h2>
          <p className="mt-1 text-xs sm:mt-2 sm:text-sm">
            {t("body")}{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              {t("policy")}
            </Link>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
            {/* Equal weight for both choices: rejecting is as easy as accepting. */}
            <Button variant="secondary" onClick={() => decide("essential")} className="min-h-11 px-3 text-sm sm:text-base">
              {t("reject")}
            </Button>
            <Button variant="secondary" onClick={() => decide("analytics")} className="min-h-11 px-3 text-sm sm:text-base">
              {t("accept")}
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
