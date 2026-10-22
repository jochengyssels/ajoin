"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

type State = "idle" | "pending" | "done" | "error" | "showcase";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const id = useId();
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("pending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), locale, company: form.get("company") }),
      });
      if (res.status === 503) setState("showcase");
      else setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="font-semibold">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md" noValidate={false}>
      <label htmlFor={`${id}-email`} className="block text-sm font-semibold">
        {t("emailLabel")}
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          className={`min-h-12 flex-1 rounded-pill border px-5 ${
            dark ? "border-flesh/40 bg-onion-dark text-flesh placeholder:text-flesh/60" : "border-line bg-white"
          }`}
        />
        {/* Honeypot for bots; hidden from people and assistive tech. */}
        <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <Button
          type="submit"
          disabled={state === "pending"}
          className={dark ? "bg-paper text-ink hover:bg-skin" : ""}
        >
          {state === "pending" ? t("pending") : t("submit")}
        </Button>
      </div>
      {state === "showcase" && (
        <p role="status" className={`mt-2 text-sm font-semibold ${dark ? "text-paper" : "text-onion"}`}>
          {t("showcase")}
        </p>
      )}
      {state === "error" && (
        <p role="alert" className={`mt-2 text-sm ${dark ? "text-paper" : "text-danger"}`}>
          {t("error")}
        </p>
      )}
      <p className={`mt-2 text-xs ${dark ? "text-flesh/80" : "text-muted"}`}>
        <Link href="/privacy" className="underline underline-offset-2">
          {t("consent")}
        </Link>
      </p>
    </form>
  );
}
