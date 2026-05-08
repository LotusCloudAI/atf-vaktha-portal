import { NextResponse } from "next/server";
import Stripe from "stripe";

// ==========================================
// STRIPE INIT
// ==========================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// ==========================================
// CREATE CHECKOUT SESSION
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ======================================
    // 🔹 INPUTS (FROM FRONTEND)
    // ======================================
    const { priceId, userId } = body;

    console.log("📥 Checkout request received");
    console.log("👤 userId:", userId);
    console.log("💰 priceId:", priceId);

    // ======================================
    // 🔴 VALIDATION
    // ======================================
    if (!priceId || !userId) {
      console.error("❌ Missing priceId or userId");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ======================================
    // 🔹 CREATE STRIPE SESSION
    // ======================================
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?cancel=true`,

      // 🔥 CRITICAL FIX (THIS WAS MISSING)
      metadata: {
        userId: userId,
        priceId: priceId,
      },
    });

    console.log("✅ Stripe session created:", session.id);

    // ======================================
    // RESPONSE
    // ======================================
    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("❌ Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}