"use client";

interface MetricsProps {
  wordCount: number;
  fillerWordCount: number;
  wpm: number;
  duration?: string; // Reserved for future use
}

export default function PerformanceMetrics({ 
  wordCount, 
  fillerWordCount, 
  wpm, 
  duration = "0:00" 
}: MetricsProps) {
  
  // SECTION 6 Logic: Compute filler percentage locally
  const fillerPercentage = wordCount > 0 
    ? ((fillerWordCount / wordCount) * 100).toFixed(1) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {/* Word Count */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-600 font-semibold uppercase">Total Words</p>
        <p className="text-2xl font-bold text-blue-900">{wordCount}</p>
      </div>

      {/* Filler Words */}
      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
        <p className="text-xs text-red-600 font-semibold uppercase">Filler Words</p>
        <p className="text-2xl font-bold text-red-900">{fillerWordCount}</p>
      </div>

      {/* Filler Percentage - Computed Locally */}
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
        <p className="text-xs text-orange-600 font-semibold uppercase">Filler %</p>
        <p className="text-2xl font-bold text-orange-900">{fillerPercentage}%</p>
      </div>

      {/* Words Per Minute */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
        <p className="text-xs text-green-600 font-semibold uppercase">Speed (WPM)</p>
        <p className="text-2xl font-bold text-green-900">{wpm}</p>
      </div>
    </div>
  );
}