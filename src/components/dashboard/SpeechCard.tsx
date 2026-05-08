"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import AICoachPanel from "./AICoachPanel";

export default function SpeechCard({ speech }: any) {
  const [openAI, setOpenAI] = useState(false);

  // ✅ Format Firebase Timestamp
  const formattedDate = speech.createdAt?.seconds
    ? new Date(speech.createdAt.seconds * 1000).toLocaleString()
    : "Unknown Date";

  return (
    <div
      className={`border rounded-lg p-5 shadow-sm bg-white transition-all ${
        speech.status === "failed" ? "border-red-200" : "border-gray-200"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-bold text-lg text-gray-800">
            {speech.title || "Untitled Speech"}
          </h2>
          <p className="text-xs text-gray-400">{formattedDate}</p>
        </div>
        <StatusBadge status={speech.status} />
      </div>

      {/* AUDIO PLAYER */}
      <div className="mb-4">
        {speech.audioUrl ? (
          <audio src={speech.audioUrl} controls className="w-full" />
        ) : (
          <p className="text-red-500 text-sm">Audio not available</p>
        )}
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6 bg-gray-50 p-3 rounded-md">
        <div>
          <p className="text-xs uppercase text-gray-500">Score</p>
          <p className="font-bold text-xl text-blue-600">
            {speech.totalScore ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500">Words</p>
          <p className="font-semibold text-gray-700">
            {speech.words ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500">WPM</p>
          <p className="font-semibold text-gray-700">
            {speech.speedWPM ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500">Filler Words</p>
          <p className="font-semibold text-gray-700">
            {speech.fillerWords ?? "-"}
          </p>
        </div>
      </div>

      {/* TRANSCRIPT */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2 text-gray-600">
          Transcript
        </h3>

        {speech.status === "completed" && speech.transcript ? (
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 max-h-40 overflow-y-auto whitespace-pre-line">
            {speech.transcript}
          </div>
        ) : speech.status === "processing" ? (
          <p className="text-yellow-600 text-sm">
            Generating transcript...
          </p>
        ) : (
          <p className="text-gray-400 text-sm">Not available</p>
        )}
      </div>

      {/* STATUS */}
      {speech.status === "processing" && (
        <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-3 rounded-md animate-pulse">
          <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
          <p className="text-sm font-medium">
            AI analysis in progress...
          </p>
        </div>
      )}

      {speech.status === "failed" && (
        <div className="bg-red-50 border border-red-100 p-3 rounded-md">
          <p className="text-red-700 text-sm font-bold">
            Processing Error
          </p>
          <p className="text-red-600 text-xs mt-1 font-mono">
            {speech.error || "Unknown error"}
          </p>
        </div>
      )}

      {/* AI INSIGHTS */}
      {speech.status === "completed" && (
        <div className="mt-3 border-t pt-4">
          <button
            onClick={() => setOpenAI(!openAI)}
            className="text-blue-600 text-sm font-semibold hover:text-blue-800"
          >
            {openAI ? "Hide AI Insights" : "View AI Insights"}
          </button>

          {openAI && (
            <div className="mt-4 space-y-4">
              {speech.feedback && (
                <AICoachPanel data={speech.feedback} />
              )}

              {/* OPTIONAL FUTURE SUPPORT */}
              {speech.clarityScore && (
                <div className="text-sm text-gray-600">
                  Clarity Score: {speech.clarityScore}
                </div>
              )}

              {speech.confidenceScore && (
                <div className="text-sm text-gray-600">
                  Confidence: {speech.confidenceScore}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}