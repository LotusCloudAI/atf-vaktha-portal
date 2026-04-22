"use client";

import { useState } from "react";
import TranscriptViewer from "./TranscriptViewer";
import StatusBadge from "./StatusBadge";
import AICoachPanel from "./AICoachPanel";
import SectionAnalysis from "./SectionAnalysis";
import ComparisonPanel from "./ComparisonPanel";

export default function SpeechCard({ speech }: any) {
  const [openAI, setOpenAI] = useState(false);
  const metrics = speech.metrics || {};

  return (
    <div className="border rounded-lg p-5 shadow bg-white">
      <div className="flex justify-between mb-3">
        <h2 className="font-semibold">Speech</h2>
        <StatusBadge status={speech.status} />
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Score</p>
          <p className="font-bold">{speech.overallScore ?? "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Words</p>
          <p>{metrics.words ?? "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">WPM</p>
          <p>{metrics.wpm ?? "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Fillers</p>
          <p>{metrics.fillerWords ?? "-"}</p>
        </div>
      </div>

      {/* TRANSCRIPT */}
      <TranscriptViewer
        transcript={speech.status === "completed" ? speech.transcript : null}
      />

      {/* AI ANALYSIS SECTION */}
      {speech.status === "processing" && (
        <p className="text-yellow-600 mt-2">
          AI analysis in progress...
        </p>
      )}

      {speech.status === "completed" && (
        <div className="mt-3 border-t pt-3">
          <button
            onClick={() => setOpenAI(!openAI)}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            {openAI ? "Hide AI Analysis" : "View AI Analysis"}
          </button>

          {openAI && (
            <div className="space-y-4 mt-3">
              <AICoachPanel data={speech.aiFeedback} />
              <SectionAnalysis sections={speech.sections} />
              <ComparisonPanel data={speech.comparison} />
            </div>
          )}
        </div>
      )}

      {/* ERROR */}
      {speech.status === "failed" && (
        <p className="text-red-600 mt-2">
          Processing failed. Please upload again.
        </p>
      )}
    </div>
  );
}