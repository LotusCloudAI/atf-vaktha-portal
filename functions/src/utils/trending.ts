export function calculateTrendingScore({
  overallScore,
  createdAt,
  userAvgScore,
}: any) {
  const now = Date.now();
  const speechTime = new Date(createdAt).getTime();

  const ageInHours = (now - speechTime) / (1000 * 60 * 60);

  // Recency boost (recent speeches rank higher)
  const recencyScore = Math.max(0, 100 - ageInHours);

  // Consistency (compared to user's average)
  const consistencyScore = userAvgScore
    ? Math.min(100, (overallScore / userAvgScore) * 100)
    : 50;

  return Math.round(
    overallScore * 0.6 +
    recencyScore * 0.3 +
    consistencyScore * 0.1
  );
}