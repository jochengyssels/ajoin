const localeTags: Record<string, string> = {
  en: "en-IE",
  fr: "fr-BE",
  nl: "nl-BE",
  it: "it-IT",
};

export function formatPrice(cents: number, locale: string): string {
  return new Intl.NumberFormat(localeTags[locale] ?? "en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
