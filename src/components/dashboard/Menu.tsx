"use client";

import Link from "next/link";

export default function Menu() {
  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <Link href="/dashboard/speeches">Upload Speech</Link>
      <Link href="/dashboard/analytics">Speech Analytics</Link>
    </div>
  );
}