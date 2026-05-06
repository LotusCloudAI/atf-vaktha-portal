"use client";

export default function UsageCard({ usage }: any) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold mb-2">Usage</h3>
      <p>Speeches Used: {usage?.speeches ?? 0}</p>
    </div>
  );
}
