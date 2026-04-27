"use client";

import LoginButton from "../components/LoginButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white py-20 text-center">
      <div className="max-w-2xl px-4">
        {/* Portal Branding */}
        <h1 className="text-5xl font-bold text-blue-700">
          ATF Vaktha Portal
        </h1>

        {/* Sub-header / Value Prop */}
        <h2 className="text-3xl font-semibold mt-4 text-gray-800">
          Speak Better. Lead Better.
        </h2>

        <p className="mt-6 text-lg text-gray-600">
          AI-powered speaking coach with real-time feedback. <br />
          <span className="italic">Leadership • Communication • Confidence</span>
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <LoginButton />
          
          <a 
            href="/dashboard/speech/demo" 
            className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Instant Demo
          </a>
        </div>
      </div>
    </main>
  );
}