import { SpeechClient } from "@google-cloud/speech";

const client = new SpeechClient();

export async function processSpeech(audioUrl: string) {
  const [response] = await client.recognize({
    audio: { uri: audioUrl },
    config: {
      encoding: "LINEAR16",
      languageCode: "en-US"
    }
  });

  const transcript =
    response.results?.map(r => r.alternatives?.[0]?.transcript).join(" ") || "";

  const words = transcript.split(" ").length;
  const fillerWords = (transcript.match(/\b(um|uh|like)\b/g) || []).length;
  const speedWPM = words / 2;

  const clarityScore = Math.max(0, 100 - fillerWords * 2);
  const confidenceScore = Math.max(0, 100 - fillerWords * 3);

  const totalScore = Math.round(
    (clarityScore + confidenceScore + speedWPM) / 3
  );

  return {
    transcript,
    words,
    fillerWords,
    speedWPM,
    clarityScore,
    confidenceScore,
    totalScore
  };
}
