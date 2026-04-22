export function calculateUserStats(speeches: any[]) {
  const total = speeches.length;

  if (total === 0) {
    return {
      totalSpeeches: 0,
      avgScore: 0,
      bestScore: 0,
      lastScore: 0,
      improvementTrend: 0,
      lastUpdated: new Date(),
    };
  }

  const scores = speeches.map(s => s.overallScore || 0);

  const avg = scores.reduce((a, b) => a + b, 0) / total;
  const best = Math.max(...scores);
  const last = scores[total - 1];
  const improvementTrend = last - scores[0];

  return {
    totalSpeeches: total,
    avgScore: Math.round(avg),
    bestScore: best,
    lastScore: last,
    improvementTrend,
    lastUpdated: new Date(),
  };
}