/**
 * Calculates a final score from 0-100 based on extracted metrics.
 */
exports.calculateScore = (metrics) => {
  let score = 100;

  // 🔹 FILLER WORDS: Penalize by 1.5 points per word [cite: 212]
  score -= metrics.fillerWords * 1.5;

  // 🔹 PACING: Penalize 15 points if speed is outside the 80-170 WPM range [cite: 213-214]
  if (metrics.wpm > 170 || metrics.wpm < 80) {
    score -= 15;
  }

  // 🔹 CLARITY: Add a bonus based on the clarity score (weighted at 30%) [cite: 216]
  score += metrics.clarityScore * 0.3;

  // 🔹 BOUNDARIES: Ensure score stays between 0 and 100 [cite: 217]
  return Math.max(0, Math.min(100, Math.round(score)));
};