"use client";

import { useState } from "react";

export default function TranscriptViewer({ transcript }: any) {
  const [open, setOpen] = useState(false);

  if (!transcript) return null;

  return (
    <div className="bg-white p-5 rounded shadow mt-4">

      <button
        onClick={() => setOpen(!open)}
        className="font-semibold text-blue-600 mb-2"
      >
        {open ? "Hide Transcript" : "View Transcript"}
      </button>

      {open && (
        <p className="text-gray-700 text-sm whitespace-pre-line mt-2">
          {transcript}
        </p>
      )}

    </div>
  );
}