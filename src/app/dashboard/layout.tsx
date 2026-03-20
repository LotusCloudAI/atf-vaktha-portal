"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Upload Speech", href: "/dashboard/upload-speech" },
    { name: "Library", href: "/dashboard/library" },
    { name: "Analytics", href: "/dashboard/analytics" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔴 Sidebar */}
      <aside className="w-64 bg-white border-r shadow-md p-6 flex flex-col">
        
        {/* Logo */}
        <h2 className="text-2xl font-bold text-atfBlue mb-10">
          ATF Vaktha
        </h2>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    isActive
                      ? "bg-atfBlue text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto text-xs text-gray-400 pt-10">
          ATF Vaktha Portal
        </div>
      </aside>

      {/* 📄 Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}