import { NextResponse } from "next/server";
import { z } from "zod";
import { createTranslator } from "next-intl";
import { locales } from "@/i18n/routing";
import { catalogue } from "@/lib/catalogue";
import { catalogueTodos } from "@/lib/catalogue/readiness";
import { parseCart } from "@/lib/cart/cart";
import { priceCart } from "@/lib/cart/pricing";
import { buildCheckoutParams } from "@/lib/stripe/checkout";
import { isLiveMode, stripe } from "@/lib/stripe/client";
import { site } from "@/lib/site";
import { isShowcase, showcaseResponse } from "@/lib/showcase";
import { freeShippingThresholdCents, shippingPlaceholder, shippingRates } from "../../../../content/shipping";

const Body = z.object({
  cart: z.unknown(),
  locale: z.enum(locales),
  country: z.string().length(2),
});

export async function POST(req: Request) {
  if (isShowcase()) return showcaseResponse();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { locale, country } = parsed.data;

  // Never take real money while the catalogue or shipping still holds placeholders.
  if (isLiveMode() && (catalogueTodos().length > 0 || shippingPlaceholder)) {
    console.error("Live checkout blocked: placeholders remain", catalogueTodos());
    return NextResponse.json({ error: "not_ready" }, { status: 503 });
  }

  const rate = shippingRates.find((r) => r.country === country);
  if (!rate) return NextResponse.json({ error: "unknown_country" }, { status: 400 });

  const [products, bundles, plans] = await Promise.all([
    catalogue.listProducts(),
    catalogue.listBundles(),
    catalogue.subscriptionPlans(),
  ]);
  // Re-price on the server: the client cart only says what, never how much.
  const priced = priceCart(parseCart(parsed.data.cart), { products, bundles, plans });

  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const t = createTranslator({ locale, messages, namespace: "checkout" });

  const params = buildCheckoutParams({
    priced,
    locale,
    rate,
    freeShippingThresholdCents,
    siteUrl: site.url,
    automaticTax: process.env.STRIPE_AUTOMATIC_TAX === "true",
    shippingLabel: t("shippingLine"),
  });
  if (typeof params === "string") return NextResponse.json({ error: params }, { status: 400 });

  try {
    const session = await stripe().checkout.sessions.create(params);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session failed", err);
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}
