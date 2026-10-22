/**
 * Showcase mode: the shop is fully browsable but doesn't take orders or send email.
 * On while Stripe isn't configured, or when SHOWCASE_MODE=true.
 */
export function isShowcase(): boolean {
  if (process.env.SHOWCASE_MODE === "true") return true;
  if (process.env.SHOWCASE_MODE === "false") return false;
  return !process.env.STRIPE_SECRET_KEY;
}

/** Forms that need email and a database are off until both exist. */
export function formsEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.RESEND_API_KEY) && process.env.SHOWCASE_MODE !== "true";
}

export const showcaseResponse = () => Response.json({ error: "showcase" }, { status: 503 });
