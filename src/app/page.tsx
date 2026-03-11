"use client";

import LoginButton from "../components/LoginButton";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-700">
          ATF Vaktha Portal
        </h1>

        <p className="mt-4 text-gray-600">
          Leadership • Communication • Confidence
        </p>

        <LoginButton />
      </div>
    </main>
  );
}