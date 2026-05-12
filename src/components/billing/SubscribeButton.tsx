"use client";

import { useState } from "react";

export default function SubscribeButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      // ✅ Check response status first (IMPORTANT)
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Checkout API error:", errorData);
        alert(errorData.error || "Checkout failed");
        return;
      }

      const data = await res.json();

      // ✅ Ensure URL exists
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Missing checkout URL:", data);
        alert("Checkout failed");
      }

    } catch (err) {
      console.error("Client error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
    >
      {loading ? "Processing..." : "Subscribe"}
    </button>
  );
}