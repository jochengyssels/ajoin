import { defineRouting } from "next-intl/routing";

export const locales = ["en", "fr", "nl", "it"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "nl",
  localePrefix: "always",
});
