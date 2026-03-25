export function generateFeedback(score: number) {
  if (score > 85) return "Excellent delivery";
  if (score > 70) return "Good, improve pacing";
  return "Needs improvement";
}
