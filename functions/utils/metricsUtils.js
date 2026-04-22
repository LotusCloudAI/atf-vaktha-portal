exports.extractMetrics = (text) => {
  const wordsArray = text.split(/\s+/);

  const fillerWordsList = ["um", "uh", "like", "you know"];

  let fillerCount = 0;

  wordsArray.forEach(word => {
    if (fillerWordsList.includes(word.toLowerCase())) {
      fillerCount++;
    }
  });

  const words = wordsArray.length;

  const durationMinutes = words / 130;
  const wpm = Math.round(words / durationMinutes);

  const clarityScore = Math.max(0, 100 - fillerCount * 2);

  return {
    words,
    fillerWords: fillerCount,
    wpm,
    clarityScore
  };
};
