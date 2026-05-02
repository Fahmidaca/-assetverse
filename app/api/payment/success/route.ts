import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import { requireHR } from "@/lib/auth-middleware";
import User from "@/models/User";
import Payment from "@/models/Payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const PACKAGE_LIMITS: Record<string, number> = {
  basic: 5,
  standard: 10,
  premium: 20,
};

const PACKAGE_PRICES: Record<string, number> = {
  basic: 0,
  standard: 5,
  premium: 10,
};

export async function POST(req: NextRequest) {
  const { user, error } = requireHR(req);
  if (error) return error;

  try {
    const { sessionId } = await req.json();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const { hrEmail, packageName } = session.metadata || {};
    if (!hrEmail || !packageName) {
      return NextResponse.json({ error: "Invalid session metadata" }, { status: 400 });
    }

    // Verify the session belongs to the authenticated HR
    if (hrEmail !== user!.email) {
      return NextResponse.json({ error: "Session does not belong to your account" }, { status: 403 });
    }

    await connectDB();

    const newLimit = PACKAGE_LIMITS[packageName] || 5;
    const amount = PACKAGE_PRICES[packageName] || 0;

    // Update HR user's package
    await User.findOneAndUpdate(
      { email: hrEmail },
      {
        $set: {
          subscription: packageName,
          packageLimit: newLimit,
        },
      }
    );

    // Record payment
    const existing = await Payment.findOne({ transactionId: session.id });
    if (!existing) {
      await Payment.create({
        hrEmail,
        packageName,
        amount,
        transactionId: session.id,
        status: "success",
        newLimit,
      });
    }

    return NextResponse.json({ success: true, packageName, newLimit });
  } catch (err) {
    console.error("Payment success error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
