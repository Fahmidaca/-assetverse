import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireHR } from "@/lib/auth-middleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const PACKAGES = [
  { name: "basic", employeeLimit: 5, price: 0, priceInCents: 0 },
  { name: "standard", employeeLimit: 10, price: 5, priceInCents: 500 },
  { name: "premium", employeeLimit: 20, price: 10, priceInCents: 1000 },
];

export async function POST(req: NextRequest) {
  const { user, error } = requireHR(req);
  if (error) return error;

  try {
    const { packageName } = await req.json();
    const pkg = PACKAGES.find((p) => p.name === packageName);
    if (!pkg) return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    if (pkg.priceInCents === 0) {
      return NextResponse.json({ error: "Cannot purchase the free plan" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `AssetVerse ${pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1)} Plan`,
              description: `Up to ${pkg.employeeLimit} employees`,
            },
            unit_amount: pkg.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/hr/package?success=true&package=${packageName}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/hr/package?cancelled=true`,
      metadata: {
        hrEmail: user!.email,
        packageName,
        newLimit: pkg.employeeLimit.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
  }
}
