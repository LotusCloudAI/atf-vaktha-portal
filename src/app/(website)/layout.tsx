import React from "react";
import Header from "../../components/website/Header";
import Footer from "../../components/website/Footer";

type LayoutProps = {
  children: React.ReactNode;
};

export default function WebsiteLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">

      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= MAIN ================= */}
      <main className="flex-1 w-full">
        
        {/* 
          IMPORTANT DESIGN RULE:
          - Keep container here for consistent alignment
          - All pages inherit spacing automatically
        */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {children}
        </div>

      </main>

      {/* ================= FOOTER ================= */}
      <Footer />

    </div>
  );
}