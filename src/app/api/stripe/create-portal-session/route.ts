import { NextResponse } from "next/server";
import Stripe from "stripe";

// ==========================================
// STRIPE INIT
// ==========================================
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// ==========================================
// FIREBASE ADMIN
// ==========================================
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// ==========================================
// CREATE BILLING PORTAL SESSION
// ==========================================
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // 🔥 GET USER FROM FIRESTORE
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    const customerId = userData?.subscription?.customerId;

    if (!customerId) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 }
      );
    }

    // 🔥 CREATE PORTAL SESSION
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url:
        "http://localhost:3000/dashboard",
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error: any) {
    console.error("❌ Billing portal error:", error.message);

    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}