"use client";

import { useState } from "react";
import { stripePromise } from "../../lib/stripe";

const plans = [
  {
    title: "Individual Monthly",
    price: "$10/month",
    priceId:
      process.env
        .NEXT_PUBLIC_STRIPE_INDIVIDUAL_MONTHLY_PRICE_ID!,
  },

  {
    title: "Individual Annual",
    price: "$75/year",
    priceId:
      process.env
        .NEXT_PUBLIC_STRIPE_INDIVIDUAL_ANNUAL_PRICE_ID!,
  },

  {
    title: "Family Annual",
    price: "$150/year",
    priceId:
      process.env
        .NEXT_PUBLIC_STRIPE_FAMILY_ANNUAL_PRICE_ID!,
  },
];

export default function MembershipPage() {
  const [loadingPriceId, setLoadingPriceId] =
    useState<string | null>(null);

  const handleCheckout = async (
    priceId: string
  ) => {
    try {
      setLoadingPriceId(priceId);

      const response = await fetch(
        "/api/stripe/checkout",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            priceId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error || "Checkout failed"
        );

        return;
      }

      const stripe =
        await stripePromise;

      if (!stripe) {
        alert("Stripe failed to load");

        return;
      }

      await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

    } catch (error) {

      console.error(error);

      alert("Something went wrong");

    } finally {

      setLoadingPriceId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">

      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-14">

          <h1 className="text-5xl font-bold text-gray-900">
            ATF Membership Plans
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Join the American Telugu
            Federation community and
            support cultural,
            educational, and leadership
            initiatives.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-3">

          {plans.map((plan) => (

            <div
              key={plan.priceId}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 flex flex-col"
            >

              <h2 className="text-2xl font-semibold text-gray-900">
                {plan.title}
              </h2>

              <p className="text-4xl font-bold text-blue-700 mt-6">
                {plan.price}
              </p>

              <ul className="mt-8 space-y-3 text-gray-600 flex-1">

                <li>
                  • Access to ATF member
                  activities
                </li>

                <li>
                  • Community networking
                </li>

                <li>
                  • Event participation
                </li>

                <li>
                  • Cultural programs
                </li>

                <li>
                  • Youth & family
                  initiatives
                </li>

              </ul>

              <button
                onClick={() =>
                  handleCheckout(
                    plan.priceId
                  )
                }

                disabled={
                  loadingPriceId ===
                  plan.priceId
                }

                className="mt-10 w-full rounded-xl bg-blue-700 hover:bg-blue-800 text-white py-3 font-semibold transition"
              >

                {loadingPriceId ===
                plan.priceId
                  ? "Processing..."
                  : "Subscribe Now"}

              </button>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}