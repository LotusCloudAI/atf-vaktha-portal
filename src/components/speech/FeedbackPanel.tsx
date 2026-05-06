"use client";

export default function FeedbackPanel({ feedback }: any) {

  const strengths = Array.isArray(feedback?.strengths)
    ? feedback.strengths
    : feedback?.strengths
    ? [feedback.strengths]
    : [];

  const improvements = Array.isArray(feedback?.improvements)
    ? feedback.improvements
    : feedback?.improvements
    ? [feedback.improvements]
    : [];

  return (
    <div className="bg-white p-5 rounded shadow mt-4">

      <h2 className="font-bold mb-3">AI Feedback</h2>

      <p className="text-gray-700 mb-3">
        {feedback?.summary || "No feedback available"}
      </p>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mb-3">
          <h3 className="font-semibold text-green-600">Strengths</h3>
          <ul className="list-disc ml-5 text-sm text-gray-600">
            {strengths.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div>
          <h3 className="font-semibold text-red-600">Improvements</h3>
          <ul className="list-disc ml-5 text-sm text-gray-600">
            {improvements.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}