import { NextResponse } from "next/server";
import Stripe from "stripe";

// ==========================================
// STRIPE INIT
// ==========================================
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("❌ STRIPE_SECRET_KEY is missing");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// ==========================================
// CREATE CHECKOUT SESSION
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { priceId, userId } = body;

    console.log("📥 Checkout request:", { userId, priceId });

    // ======================================
    // VALIDATION
    // ======================================
    if (!priceId || !userId) {
      return NextResponse.json(
        { error: "Missing priceId or userId" },
        { status: 400 }
      );
    }

    // ======================================
    // BASE URL
    // ======================================
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // ======================================
    // CREATE SESSION
    // ======================================
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      // ✅ FIXED (IMPORTANT)
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/dashboard?cancel=true`,

      metadata: {
        userId,
        priceId,
      },

      allow_promotion_codes: true,
    });

    console.log("✅ Session created:", session.id);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("❌ Checkout error:", error);

    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    );
  }
}