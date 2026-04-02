import { SpeechClient } from "@google-cloud/speech";

const client = new SpeechClient();

export async function processSpeech(audioUrl: string) {
  const [response] = await client.recognize({
    audio: { uri: audioUrl },
    config: {
      encoding: "LINEAR16",
      languageCode: "en-US",
    },
  });

  const transcript =
    response.results?.map((r: any) => r.alternatives?.[0]?.transcript || "").join(" ") || "";

  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  const fillerWords =
    (transcript.toLowerCase().match(/\b(um|uh|like|you know)\b/g) || []).length;

  const speedWPM = words / 2;

  const clarityScore = Math.max(0, 100 - fillerWords * 2);
  const confidenceScore = Math.max(0, 100 - fillerWords * 3);

  let speedScore = 100;
  if (speedWPM < 110) speedScore = Math.max(0, 100 - (110 - speedWPM));
  else if (speedWPM > 160) speedScore = Math.max(0, 100 - (speedWPM - 160));

  let feedback = "Great job! Your speech was clear and well-paced.";

  if (fillerWords > 5) {
    feedback = "Reduce filler words like 'um' and 'uh'.";
  } else if (speedWPM > 160) {
    feedback = "You are speaking too fast.";
  } else if (speedWPM < 110 && words > 20) {
    feedback = "Try speaking with more energy.";
  }

  const score = Math.round((clarityScore + confidenceScore + speedScore) / 3);

  return {
    transcript,
    words,
    fillerWords,
    speedWPM,
    clarityScore,
    speedScore,
    confidenceScore,
    score,
    feedback,
  };
}