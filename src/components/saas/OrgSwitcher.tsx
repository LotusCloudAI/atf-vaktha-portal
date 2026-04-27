"use client";

import { useOrganization } from "../../lib/hooks/useOrganization";

export default function OrgSwitcher() {
  const { orgId, loading } = useOrganization();

  if (loading) return <p>Loading organization...</p>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500 text-sm">Organization</p>
      <h2 className="font-bold">{orgId || "No Organization"}</h2>
    </div>
  );
}
