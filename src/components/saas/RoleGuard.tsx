"use client";

export default function RoleGuard({ role, allowed, children }: any) {
  if (!role) return null;
  if (!allowed.includes(role)) return null;

  return children;
}
