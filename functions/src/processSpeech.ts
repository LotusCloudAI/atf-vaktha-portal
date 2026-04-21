import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * ATF VAKTHA — AI SPEECH PROCESSOR (PHASE 2 + 3 READY)
 */
export const processSpeechStorage = onObjectFinalized(async (event) => {
  const object = event.data;
  const filePath = object.name || "";

  // ----------------------------------
  // 1. FILTER VALID FILES
  // ----------------------------------
  if (!filePath.includes("speeches/")) return;

  if (!(filePath.endsWith(".wav") || filePath.endsWith(".mp3"))) return;

  // ----------------------------------
  // 2. SAFE DOC ID EXTRACTION
  // ----------------------------------
  const fileName = filePath.split("/").pop() || "";
  const docId = fileName.replace(/\.(wav|mp3)$/, "");

  if (!docId) return;

  const ref = db.collection("speeches").doc(docId);

  try {
    const docSnap = await ref.get();
    if (!docSnap.exists) return;

    // ----------------------------------
    // 3. TRANSCRIPT (SAFE FALLBACK)
    // ----------------------------------
    let transcript = object.metadata?.transcript || "";

    if (!transcript || transcript.trim().length < 10) {
      await ref.update({
        status: "failed",
        error: "Transcript missing or too short",
        updatedAt: new Date(),
      });
      return;
    }

    // ----------------------------------
    // 4. CLEAN TRANSCRIPT
    // ----------------------------------
    const cleanTranscript = transcript
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

    const wordsArray = cleanTranscript.split(/\s+/);
    const words = wordsArray.length;

    // ----------------------------------
    // 5. AUDIO DURATION (SAFE DEFAULT)
    // ----------------------------------
    const audioDuration = Number(object.metadata?.duration) || 60;
    const durationMinutes = Math.max(audioDuration / 60, 0.5);
    const wpm = Math.round(words / durationMinutes);

    // ----------------------------------
    // 6. FILLER WORD DETECTION (FIXED)
    // ----------------------------------
    const fillerWordsList = ["you know", "actually", "basically", "um", "uh", "like", "so"];
    let fillerCount = 0;

    for (const word of fillerWordsList) {
      const regex = new RegExp(`\\b${word}\\b`, "gi"); // FIXED
      const matches = cleanTranscript.match(regex);
      if (matches) fillerCount += matches.length;
    }

    // ----------------------------------
    // 7. SCORING LOGIC
    // ----------------------------------
    const clarityScore = Math.max(0, 100 - fillerCount * 2);

    let speedScore = 70;
    if (wpm >= 120 && wpm <= 160) speedScore = 100;
    else if ((wpm >= 100 && wpm < 120) || (wpm > 160 && wpm <= 180)) speedScore = 85;

    const overallScore = Math.round(clarityScore * 0.6 + speedScore * 0.4);

    // ----------------------------------
    // 8. AI FEEDBACK ENGINE
    // ----------------------------------
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (clarityScore > 80) {
      strengths.push("Clear speech delivery");
    } else {
      weaknesses.push("Too many filler words");
      suggestions.push("Reduce filler words like 'um', 'uh'");
    }

    if (wpm >= 120 && wpm <= 160) {
      strengths.push("Good speaking pace");
    } else {
      weaknesses.push("Speaking speed needs improvement");
      suggestions.push("Maintain 120–160 words per minute");
    }

    if (words < 50) {
      weaknesses.push("Speech content is too short");
      suggestions.push("Expand with more supporting ideas");
    }

    // ----------------------------------
    // 9. SIMPLE FEEDBACK STRING (FOR UI)
    // ----------------------------------
    const feedbackText = [...strengths, ...suggestions].join(". ");

    // ----------------------------------
    // 10. FINAL FIRESTORE UPDATE (PHASE 2 COMPATIBLE)
    // ----------------------------------
    await ref.update({
      transcript,

      metrics: {
        words,
        wpm,
        fillerWords: fillerCount,
        clarityScore,
        speedScore,
      },

      overallScore,

      feedback: feedbackText, // Phase 2 UI uses this
      aiFeedback: {
        strengths,
        weaknesses,
        suggestions,
      },

      scoringVersion: "v2-phase3",
      status: "completed",
      updatedAt: new Date(),
    });

    console.log(`Successfully updated doc: ${docId}`);

  } catch (error: any) {
    console.error("Processing error:", error);

    await ref.update({
      status: "failed",
      error: error.message,
      updatedAt: new Date(),
    });
  }
});