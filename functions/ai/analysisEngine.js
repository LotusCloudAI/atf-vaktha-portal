/**
 * Analyzes raw metrics to determine performance levels.
 */
export const analyzeMetrics = (metrics) => {
  return {
    // Filler word thresholds
    fillerLevel: metrics.fillerWords < 3 ? "low" : metrics.fillerWords < 8 ? "medium" : "high",
    
    // Speaking speed thresholds (Ideal is 120-160 WPM)
    speedLevel: metrics.wpm < 100 ? "slow" : metrics.wpm > 160 ? "fast" : "ideal",
    
    // Clarity thresholds
    clarityLevel: metrics.clarityScore > 80 ? "high" : "low"
  };
};