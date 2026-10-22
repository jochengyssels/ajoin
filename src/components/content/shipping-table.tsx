import { createTranslator } from "next-intl";
import { formatPrice } from "@/lib/format";
import { freeShippingThresholdCents, shippingPlaceholder, shippingRates } from "../../../content/shipping";
import en from "../../../messages/en.json";
import fr from "../../../messages/fr.json";
import nl from "../../../messages/nl.json";
import it from "../../../messages/it.json";

const all = { en, fr, nl, it };

/** Shipping rates straight from content/shipping.ts, so the page and checkout never disagree. */
export function ShippingTable({ locale }: { locale: keyof typeof all }) {
  const t = createTranslator({ locale, messages: all[locale] });
  // Until the brand confirms rates, list only where we ship: no invented prices or delivery times.
  if (shippingPlaceholder) {
    return (
      <ul>
        {shippingRates.map((r) => (
          <li key={r.country}>{t(`countries.${r.country}`)}</li>
        ))}
      </ul>
    );
  }
  return (
    <table>
      <thead>
        <tr>
          <th>{t("shippingTable.country")}</th>
          <th>{t("shippingTable.cost")}</th>
          <th>{t("shippingTable.time")}</th>
        </tr>
      </thead>
      <tbody>
        {shippingRates.map((r) => (
          <tr key={r.country}>
            <td>{t(`countries.${r.country}`)}</td>
            <td>{formatPrice(r.amountCents, locale)}</td>
            <td>{t("shippingTable.days", { min: r.minDays, max: r.maxDays })}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3}>{t("shippingTable.free", { amount: formatPrice(freeShippingThresholdCents, locale) })}</td>
        </tr>
      </tfoot>
    </table>
  );
}
