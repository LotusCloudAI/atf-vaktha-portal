export function analyzeSpeech(text: string, durationSeconds: number) {

  if (!text || durationSeconds <= 0) {
    return {
      words: 0,
      wpm: 0,
      fillerCount: 0,
      score: 0
    };
  }

  const wordsArray = text.trim().split(/\s+/);
  const wordCount = wordsArray.length;

  const wpm = Math.round((wordCount / durationSeconds) * 60);

  const fillerWords = ["um", "uh", "like", "you know"];
  let fillerCount = 0;

  wordsArray.forEach(word => {
    if (fillerWords.includes(word.toLowerCase())) {
      fillerCount++;
    }
  });

  let score = 100;

  if (wpm < 80) score -= 10;
  if (wpm > 160) score -= 10;
  if (fillerCount > 5) score -= 10;

  score = Math.max(0, score);

  return {
    words: wordCount,
    wpm,
    fillerCount,
    score
  };
}
