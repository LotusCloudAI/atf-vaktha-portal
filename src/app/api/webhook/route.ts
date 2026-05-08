import { NextResponse } from "next/server";
import Stripe from "stripe";

// ==========================================
// STRIPE INIT
// ==========================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// ==========================================
// FIREBASE ADMIN INIT
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
// WEBHOOK HANDLER
// ==========================================
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  console.log("🔔 Event received:", event.type);

  // =========================================
  // 🎯 HANDLE EVENTS
  // =========================================

  // ✅ PAYMENT SUCCESS
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("✅ Payment success:", session.id);

    try {
      const userId = session.metadata?.userId;
      const priceId = session.metadata?.priceId;

      console.log("👤 Metadata userId:", userId);

      if (!userId) {
        console.error("❌ Missing userId in metadata");
        return NextResponse.json({ received: true });
      }

      console.log("🔥 Writing subscription to Firestore...");

      await db.collection("users").doc(userId).set(
        {
          subscription: {
            status: "active",
            priceId: priceId || null,
            customerId: session.customer || null,
            subscriptionId: session.subscription || null,
            updatedAt: new Date(),
          },
        },
        { merge: true }
      );

      console.log("✅ Subscription saved for:", userId);
    } catch (error) {
      console.error("❌ Firestore write error:", error);
    }
  }

  // ❌ SUBSCRIPTION CANCELLED (FIXED VERSION)
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    try {
      const customerId = subscription.customer;

      console.log("📦 Cancel event for customer:", customerId);

      const snapshot = await db
        .collection("users")
        .where("subscription.customerId", "==", customerId)
        .get();

      console.log("📊 Matching users found:", snapshot.size);

      if (snapshot.empty) {
        console.error("❌ No users found for this customerId");
        return NextResponse.json({ received: true });
      }

      for (const doc of snapshot.docs) {
        console.log("🔥 Updating user:", doc.id);

        await doc.ref.update({
          "subscription.status": "cancelled",
          "subscription.updatedAt": new Date(),
        });

        console.log("✅ Updated user:", doc.id);
      }

      console.log("🎯 Subscription cancellation COMPLETE");
    } catch (error) {
      console.error("❌ Cancel handling error:", error);
    }
  }

  // =========================================
  // RESPONSE (REQUIRED)
  // ==========================================
  return NextResponse.json({ received: true });
}