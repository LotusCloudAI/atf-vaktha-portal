"use client";

export default function TranscriptViewer({ text }: { text: string }) {
  if (!text || text.trim() === "") {
    return (
      <div className="bg-white p-5 rounded shadow">
        <h2 className="font-bold mb-3">Transcript</h2>
        <p className="text-gray-400">No transcript available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="font-bold mb-3">Transcript</h2>
      <p className="text-gray-700 whitespace-pre-line">{text}</p>
    </div>
  );
}