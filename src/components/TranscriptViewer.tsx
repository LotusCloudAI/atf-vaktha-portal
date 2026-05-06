"use client";

import { useState } from "react";

export default function TranscriptViewer({ transcript }) {
  const [open, setOpen] = useState(false);

  if (!transcript) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-blue-600 text-sm"
      >
        {open ? "Hide Transcript" : "View Transcript"}
      </button>

      {open && (
        <div className="mt-2 p-3 border rounded bg-gray-50 text-sm">
          {transcript}
        </div>
      )}
    </div>
  );
}
