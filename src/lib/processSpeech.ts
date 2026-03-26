export function processSpeech(transcript: string, durationSeconds: number) {
  const wordsArray = transcript.trim().split(/\s+/);

  const words = wordsArray.length;

  const minutes = durationSeconds / 60;
  const speedWPM = minutes > 0 ? Math.round(words / minutes) : 0;

  const fillerList = ["um", "uh", "like", "you know", "so"];
  let fillerWords = 0;

  wordsArray.forEach((word) => {
    if (fillerList.includes(word.toLowerCase())) {
      fillerWords++;
    }
  });

  const speechScore = Math.max(
    0,
    100 - fillerWords * 2 - Math.abs(speedWPM - 130)
  );

  return {
    words,
    speedWPM,
    fillerWords,
    speechScore,
  };
}