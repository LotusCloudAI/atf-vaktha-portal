import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type LayoutProps = {
  children: React.ReactNode;
};

export default function WebsiteLayout({ children }: LayoutProps) {
  return (
    <>
      {/* Website Header */}
      <Header />

      {/* Page Content */}
      <main className="min-h-screen">{children}</main>

      {/* Website Footer */}
      <Footer />
    </>
  );
}