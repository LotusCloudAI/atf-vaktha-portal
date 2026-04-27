"use client";

export default function PlanCard({ plan }: any) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold">Current Plan</h3>
      <p>{plan || "FREE"}</p>
    </div>
  );
}
