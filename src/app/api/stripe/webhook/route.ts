import { NextResponse } from "next/server";
import Stripe from "stripe";

// ==========================================
// ✅ STRIPE INIT (SAFE)
// ==========================================
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY missing");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET missing");
}

// 🔥 NO apiVersion → avoids future type issues
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ==========================================
// ✅ FIREBASE ADMIN (CLEAN IMPORT)
// ==========================================
import { adminDb } from "@/lib/firebaseAdmin";

const db = adminDb;

// ==========================================
// ✅ WEBHOOK HANDLER
// ==========================================
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("Missing Stripe signature");
    return new NextResponse("Missing signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Signature verification failed:", err.message);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  console.log("Stripe Event:", event.type);

  try {
    switch (event.type) {

      // =========================================
      // ✅ CHECKOUT COMPLETED
      // =========================================
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;
        const priceId = session.metadata?.priceId;

        if (!userId) {
          console.error("Missing userId in metadata");
          break;
        }

        // 🔥 PLAN LOGIC
        let plan = "pro";
        if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
          plan = "elite";
        }

        await db.collection("users").doc(userId).set(
          {
            subscription: {
              status: "active",
              plan,
              priceId: priceId || null,
              customerId: session.customer || null,
              subscriptionId: session.subscription || null,
              currentPeriodStart: new Date(),
              updatedAt: new Date(),
            },
          },
          { merge: true }
        );

        console.log("User upgraded:", userId, "Plan:", plan);
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
          console.warn("No user found for customer:", customerId);
          break;
        }

        await Promise.all(
          snapshot.docs.map((doc) =>
            doc.ref.update({
              "subscription.status": "active",
              "subscription.updatedAt": new Date(),
            })
          )
        );

        console.log("Renewal success:", customerId);
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

        await Promise.all(
          snapshot.docs.map((doc) =>
            doc.ref.update({
              "subscription.status": "past_due",
              "subscription.updatedAt": new Date(),
            })
          )
        );

        console.log("Payment failed:", customerId);
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

        await Promise.all(
          snapshot.docs.map((doc) =>
            doc.ref.update({
              "subscription.status": "cancelled",
              "subscription.plan": "free",
              "subscription.updatedAt": new Date(),
            })
          )
        );

        console.log("Subscription cancelled:", customerId);
        break;
      }

      default:
        console.log("Unhandled event:", event.type);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }

  return NextResponse.json({ received: true });
}