"use client";

import { useState } from "react";

export default function TranscriptViewer({ transcript }: any) {
  const [open, setOpen] = useState(false);

  if (!transcript) {
    return <p className="text-gray-400 text-sm">Not ready</p>;
  }

  return (
    <div className="mt-3">

      <button
        onClick={() => setOpen(!open)}
        className="text-blue-600 text-sm"
      >
        {open ? "Hide" : "View"} Transcript
      </button>

      {open && (
        <p className="mt-2 whitespace-pre-line">
          {transcript}
        </p>
      )}

    </div>
  );
}
