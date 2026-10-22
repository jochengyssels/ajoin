import type { Metadata } from "next";
import { and, eq, gt } from "drizzle-orm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db, schema } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { hashToken } from "@/lib/tokens";
import { SimplePage } from "@/components/layout/simple-page";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { robots: { index: false } };

export default async function OrderViewPage({ params, searchParams }: PageProps<"/[locale]/orders/view">) {
  const { locale: l } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "orders" });
  const token = (await searchParams).token;

  const tokenRow =
    typeof token === "string"
      ? await db().query.orderLookupTokens.findFirst({
          where: and(eq(schema.orderLookupTokens.tokenHash, hashToken(token)), gt(schema.orderLookupTokens.expiresAt, new Date())),
        })
      : undefined;
  if (!tokenRow) redirect({ href: "/orders?expired=1", locale });

  const order = await db().query.orders.findFirst({
    where: eq(schema.orders.id, tokenRow!.orderId),
    with: { items: true },
  });
  if (!order) redirect({ href: "/orders?expired=1", locale });
  const o = order!;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(o.createdAt);

  return (
    <SimplePage title={t("viewTitle", { number: o.number })} intro={t("placed", { date })}>
      <dl className="mb-8 flex gap-3">
        <dt className="font-semibold">{t("status")}:</dt>
        <dd>{t(`statuses.${o.status}`)}</dd>
      </dl>
      <h2 className="text-2xl">{t("items")}</h2>
      <table className="mt-4 w-full max-w-xl text-left">
        <tbody className="divide-y divide-line">
          {o.items.map((i) => (
            <tr key={i.id}>
              <td className="py-3">
                {i.quantity} × {i.name}
              </td>
              <td className="py-3 text-right tabular-nums">{formatPrice(i.totalCents, locale)}</td>
            </tr>
          ))}
          <tr>
            <td className="py-3">{t("shipping")}</td>
            <td className="py-3 text-right tabular-nums">{formatPrice(o.shippingCents, locale)}</td>
          </tr>
          <tr className="font-semibold">
            <td className="py-3">{t("total")}</td>
            <td className="py-3 text-right tabular-nums">{formatPrice(o.totalCents, locale)}</td>
          </tr>
          <tr className="text-sm text-muted">
            <td className="py-2">{t("tax")}</td>
            <td className="py-2 text-right tabular-nums">{formatPrice(o.taxCents, locale)}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-10 flex flex-wrap gap-4">
        {o.status !== "withdrawn" && o.status !== "refunded" && (
          <ButtonLink href="/withdrawal" variant="secondary">
            {t("withdraw")}
          </ButtonLink>
        )}
        {o.stripeSubscriptionId && o.stripeCustomerId && (
          <form action="/api/billing-portal" method="post">
            <input type="hidden" name="token" value={String(token)} />
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="inline-flex min-h-12 items-center rounded-pill bg-onion px-6 font-semibold text-flesh">
              {t("manageSubscription")}
            </button>
          </form>
        )}
      </div>
    </SimplePage>
  );
}
