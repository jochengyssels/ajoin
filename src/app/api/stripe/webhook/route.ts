import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import {
  alreadyProcessed,
  createOrderFromRenewal,
  createOrderFromSession,
  markProcessed,
  markRefunded,
} from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    // Signature is computed over the raw body, so read it as text, not JSON.
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    console.warn("Webhook signature verification failed", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (await alreadyProcessed(event.id)) return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const order = await createOrderFromSession(event.data.object.id);
        if (order) await sendOrderConfirmation(order);
        break;
      }
      case "invoice.paid": {
        const order = await createOrderFromRenewal(event.data.object);
        if (order) await sendOrderConfirmation(order);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (pi && charge.refunded) await markRefunded(pi);
        break;
      }
      default:
        break;
    }
    // Record only after success, so a failure is retried by Stripe.
    await markProcessed(event);
  } catch (err) {
    console.error(`Webhook ${event.type} failed`, err);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
