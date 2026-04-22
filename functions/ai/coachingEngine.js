const { analyzeMetrics } = require("./analysisEngine");
const { feedbackTemplates } = require("./feedbackTemplates");

/**
 * Generates structured AI coaching feedback based on speech metrics.
 */
exports.generateCoaching = (metrics) => {
  const analysis = analyzeMetrics(metrics);

  // Map the analyzed levels (low/medium/high) to specific feedback strings
  const feedback = [
    feedbackTemplates.fillerWords[analysis.fillerLevel],
    feedbackTemplates.speed[analysis.speedLevel],
    feedbackTemplates.clarity[analysis.clarityLevel]
  ];

  return { feedback, analysis };
};