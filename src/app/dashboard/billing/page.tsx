"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useApp } from "../../../lib/context/AppContext";
import PlanCard from "../../../components/saas/PlanCard";
import UsageCard from "../../../components/saas/UsageCard";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

export default function BillingPage() {
  const { plan, usage } = useApp();

  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST", // Ensure you are using POST for session creation
      });
      const data = await res.json();

      const stripe = await stripePromise;
      if (data.id) {
        await stripe?.redirectToCheckout({ sessionId: data.id });
      } else {
        console.error("No session ID returned");
      }
    } catch (err) {
      console.error("Billing error", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Subscription & Billing</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Current Plan</h2>
          <PlanCard plan={plan} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Usage</h2>
          <UsageCard usage={usage} />
        </section>
      </div>

      {plan === "FREE" && (
        <div className="p-6 border border-blue-100 bg-blue-50 rounded-xl">
          <h3 className="font-bold text-lg mb-2">Upgrade to Pro</h3>
          <p className="text-gray-600 mb-4">
            Get unlimited speech uploads and advanced analytics by upgrading to our Pro plan.
          </p>
          <button
            onClick={handleUpgrade}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}