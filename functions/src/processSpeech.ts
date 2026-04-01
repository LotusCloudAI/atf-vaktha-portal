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

  const words = transcript.trim().split(/\s+/).length;
  
  // Count common filler words
  const fillerWords = (transcript.toLowerCase().match(/\b(um|uh|like|you know)\b/g) || []).length;
  
  // Assuming the audio is roughly 2 minutes based on your original math (words / 2).
  // Note: For a perfectly accurate WPM in production, you might want to calculate this using the actual audio duration.
  const speedWPM = words / 2; 

  // Phase 2: clarityScore
  const clarityScore = Math.max(0, 100 - fillerWords * 2);
  const confidenceScore = Math.max(0, 100 - fillerWords * 3);

  // Phase 2: speedScore (Ideal speaking rate is generally 130-160 WPM)
  let speedScore = 100;
  if (speedWPM < 110) {
    speedScore = Math.max(0, 100 - (110 - speedWPM));
  } else if (speedWPM > 160) {
    speedScore = Math.max(0, 100 - (speedWPM - 160));
  }

  // Phase 2: feedback generation
  let feedback = "Great job! Your speech was clear and well-paced.";
  if (fillerWords > 5) {
    feedback = "Try to reduce filler words like 'um' and 'uh' to improve your clarity score.";
  } else if (speedWPM > 160) {
    feedback = "You are speaking a bit too fast. Try slowing down your pace for better comprehension.";
  } else if (speedWPM < 110 && words > 20) {
    feedback = "Your pace is a bit slow. Try speaking with a bit more energy and flow.";
  }

  const totalScore = Math.round(
    (clarityScore + confidenceScore + speedScore) / 3
  );

  return {
    transcript,
    words,
    fillerWords,
    speedWPM,
    clarityScore,       
    speedScore,         
    confidenceScore,
    score: totalScore,  
    feedback            
  };
}