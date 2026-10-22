"use client";

import { useLocale } from "next-intl";
import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export interface Field {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "checkbox";
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  /** Uppercase the value as typed (order numbers). */
  upper?: boolean;
}

/** A small accessible form that posts JSON to an API route and shows the outcome. */
export function ApiForm({
  endpoint,
  fields,
  submitLabel,
  pendingLabel,
  success,
  errorMessage,
  errorMessages = {},
  requiredLabel,
}: {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
  pendingLabel: string;
  success: ReactNode;
  errorMessage: string;
  errorMessages?: Record<string, string>;
  requiredLabel: string;
}) {
  const locale = useLocale();
  const id = useId();
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { locale, company: form.get("company") };
    for (const f of fields) {
      body[f.name] = f.type === "checkbox" ? form.get(f.name) === "on" : String(form.get(f.name) ?? "").trim() || undefined;
    }
    setState("pending");
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setError(errorMessages[String(json.error)] ?? errorMessage);
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError(errorMessage);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-card bg-paper p-6">
        {success}
      </div>
    );
  }

  const input = "mt-1 block min-h-12 w-full rounded-soft border-2 border-line bg-white px-4 focus:border-onion";

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-5">
      {fields.map((f) => {
        const fid = `${id}-${f.name}`;
        const hintId = f.hint ? `${fid}-hint` : undefined;
        if (f.type === "checkbox") {
          return (
            <div key={f.name} className="flex items-start gap-3">
              <input id={fid} name={f.name} type="checkbox" required={f.required} className="mt-1 size-5 accent-[var(--color-onion)]" />
              <label htmlFor={fid} className="font-semibold">
                {f.label}
              </label>
            </div>
          );
        }
        return (
          <div key={f.name}>
            <label htmlFor={fid} className="block text-sm font-semibold">
              {f.label}
              {f.required && <span className="sr-only"> ({requiredLabel})</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea id={fid} name={f.name} required={f.required} rows={6} className={`${input} py-3`} aria-describedby={hintId} />
            ) : (
              <input
                id={fid}
                name={f.name}
                type={f.type ?? "text"}
                required={f.required}
                autoComplete={f.autoComplete}
                aria-describedby={hintId}
                className={`${input} ${f.upper ? "uppercase" : ""}`}
              />
            )}
            {f.hint && (
              <p id={hintId} className="mt-1 text-sm text-muted">
                {f.hint}
              </p>
            )}
          </div>
        );
      })}
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={state === "pending"}>
        {state === "pending" ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
