import { NextResponse } from "next/server";
import Stripe from "stripe";

// ==========================================
// ✅ STRIPE INIT
// ==========================================
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("❌ STRIPE_SECRET_KEY missing");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("❌ STRIPE_WEBHOOK_SECRET missing");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// ==========================================
// ✅ FIREBASE ADMIN INIT
// ==========================================
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    throw new Error("❌ Firebase Admin ENV missing");
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// ==========================================
// ✅ WEBHOOK HANDLER
// ==========================================
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return new NextResponse("Missing signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("❌ Signature verification failed:", err.message);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  console.log("🔔 Stripe Event:", event.type);

  try {
    switch (event.type) {

      // =========================================
      // ✅ CHECKOUT COMPLETED (FIRST PAYMENT)
      // =========================================
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;
        const priceId = session.metadata?.priceId;

        if (!userId) {
          console.error("❌ Missing userId in metadata");
          break;
        }

        // 🔥 PLAN MAPPING (PRO vs ELITE)
        let plan = "pro";

        if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
          plan = "elite";
        }

        await db.collection("users").doc(userId).set(
          {
            subscription: {
              status: "active",
              plan: plan,
              priceId: priceId || null,
              customerId: session.customer || null,
              subscriptionId: session.subscription || null,
              currentPeriodStart: new Date(),
              updatedAt: new Date(),
            },
          },
          { merge: true }
        );

        console.log("✅ User upgraded:", userId, "Plan:", plan);
        break;
      }

      // =========================================
      // 🔁 PAYMENT SUCCESS (RENEWAL)
      // =========================================
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const snapshot = await db
          .collection("users")
          .where("subscription.customerId", "==", customerId)
          .get();

        if (snapshot.empty) {
          console.warn("⚠️ No user found for customer:", customerId);
          break;
        }

        const updates = snapshot.docs.map((doc) =>
          doc.ref.update({
            "subscription.status": "active",
            "subscription.updatedAt": new Date(),
          })
        );

        await Promise.all(updates);

        console.log("💰 Renewal success:", customerId);
        break;
      }

      // =========================================
      // ❌ PAYMENT FAILED
      // =========================================
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const snapshot = await db
          .collection("users")
          .where("subscription.customerId", "==", customerId)
          .get();

        const updates = snapshot.docs.map((doc) =>
          doc.ref.update({
            "subscription.status": "past_due",
            "subscription.updatedAt": new Date(),
          })
        );

        await Promise.all(updates);

        console.log("❌ Payment failed:", customerId);
        break;
      }

      // =========================================
      // ❌ SUBSCRIPTION CANCELLED
      // =========================================
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const snapshot = await db
          .collection("users")
          .where("subscription.customerId", "==", customerId)
          .get();

        const updates = snapshot.docs.map((doc) =>
          doc.ref.update({
            "subscription.status": "cancelled",
            "subscription.plan": "free",
            "subscription.updatedAt": new Date(),
          })
        );

        await Promise.all(updates);

        console.log("❌ Subscription cancelled:", customerId);
        break;
      }

      default:
        console.log("ℹ️ Unhandled event:", event.type);
    }
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
  }

  return NextResponse.json({ received: true });
}