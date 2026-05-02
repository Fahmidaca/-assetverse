import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

const PACKAGE_LIMITS: Record<string, number> = { basic: 5, standard: 10, premium: 20 };
const PACKAGE_PRICES: Record<string, number> = { basic: 0, standard: 5, premium: 10 };

// Stripe webhook needs the raw body (not Next's parsed JSON) to verify the signature
export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    await connectDB();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "paid") break;

        const { hrEmail, packageName } = session.metadata || {};
        if (!hrEmail || !packageName) {
          console.error("Webhook session missing metadata", session.id);
          break;
        }

        const newLimit = PACKAGE_LIMITS[packageName] || 5;
        const amount = PACKAGE_PRICES[packageName] || 0;

        // Idempotency — only process each session once
        const existing = await Payment.findOne({ transactionId: session.id });
        if (existing) {
          console.log(`Webhook: session ${session.id} already processed, skipping`);
          break;
        }

        await User.findOneAndUpdate(
          { email: hrEmail },
          { $set: { subscription: packageName, packageLimit: newLimit } }
        );

        await Payment.create({
          hrEmail,
          packageName,
          amount,
          transactionId: session.id,
          status: "success",
          newLimit,
        });

        console.log(`Webhook: upgraded ${hrEmail} to ${packageName} (${newLimit} employees)`);
        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { hrEmail, packageName } = session.metadata || {};
        if (hrEmail) {
          await Payment.create({
            hrEmail,
            packageName: packageName || "unknown",
            amount: 0,
            transactionId: session.id,
            status: "failed",
            newLimit: 0,
          });
          console.log(`Webhook: payment failed/expired for ${hrEmail}`);
        }
        break;
      }

      default:
        console.log(`Webhook: unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
