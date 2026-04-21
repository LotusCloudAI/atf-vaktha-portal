import { setGlobalOptions } from "firebase-functions/v2";
import { onObjectFinalized, StorageEvent } from "firebase-functions/v2/storage";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { SpeechClient, protos } from "@google-cloud/speech";
import * as path from "path";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const speechClient = new SpeechClient();
const db = admin.firestore();

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

const SUPPORTED_AUDIO = [".wav", ".mp3", ".m4a"];
const FILLER_WORDS_LIST = ["um", "uh", "like", "you know", "actually", "basically", "so", "right"];

// ======================
// SCORE CALCULATION
// ======================
function calculateSpeechScore(wordCount: number, fillerRate: number, wpm: number, vocabularyRatio: number) {
  let paceScore = 0;
  let fillerScore = 0;
  let vocabScore = 0;
  let lengthScore = 0;

  if (wpm >= 120 && wpm <= 170) paceScore = 25;
  else if (wpm >= 100) paceScore = 20;
  else paceScore = 10;

  if (fillerRate < 0.01) fillerScore = 25;
  else if (fillerRate < 0.03) fillerScore = 20;
  else fillerScore = 10;

  if (vocabularyRatio > 0.6) vocabScore = 25;
  else if (vocabularyRatio > 0.45) vocabScore = 20;
  else vocabScore = 10;

  if (wordCount > 120) lengthScore = 25;
  else if (wordCount > 80) lengthScore = 20;
  else lengthScore = 10;

  let speedScore = 100;
  if (wpm < 110) speedScore = Math.max(0, 100 - (110 - wpm));
  else if (wpm > 160) speedScore = Math.max(0, 100 - (wpm - 160));

  let feedback = "Great job! Your speech was clear and well-paced.";
  if (fillerRate > 0.05) feedback = "Reduce filler words.";
  else if (wpm > 170) feedback = "You are speaking too fast.";
  else if (wpm < 100) feedback = "Try speaking with more energy.";

  const total = paceScore + fillerScore + vocabScore + lengthScore;

  return {
    total,
    clarity: fillerScore * 4,
    confidence: (paceScore + fillerScore) * 2,
    speed: speedScore,
    feedback,
  };
}

// ======================
// MAIN FUNCTION
// ======================
export const processSpeech = onObjectFinalized(async (event: StorageEvent) => {
  try {
    const filePath = event.data.name;
    const bucketName = event.data.bucket;

    if (!filePath || !filePath.startsWith("speeches/")) return;

    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const docId = fileName.replace(ext, "");

    if (!SUPPORTED_AUDIO.includes(ext)) {
      logger.warn("Unsupported format:", ext);
      return;
    }

    const audioUri = `gs://${bucketName}/${filePath}`;
    logger.log(`Processing: ${audioUri}`);

    // ======================
    // 🔥 ENCODING FIX (CRITICAL)
    // ======================
    let encoding;

if (ext === ".mp3") {
  encoding = protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3;
} else if (ext === ".wav") {
  encoding = protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16;
} else {
  encoding = protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED;
}

const request = {
  audio: { uri: audioUri },
  config: {
    encoding,
    languageCode: "en-US",
    enableAutomaticPunctuation: true,
    model: "latest_long",
  },
};

    const [operation] = await speechClient.longRunningRecognize(request);
    const [response] = await operation.promise();

    const transcript =
      response.results
        ?.map(r => r.alternatives?.[0]?.transcript || "")
        .join(" ")
        .trim() || "";

    if (!transcript) {
      logger.warn("Empty transcript:", docId);
      return;
    }

    // ======================
    // METRICS
    // ======================
    const wordsArray = transcript.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = wordsArray.length;
    const uniqueWords = new Set(wordsArray);

    const fillerWordCount = wordsArray.filter(w =>
      FILLER_WORDS_LIST.includes(w)
    ).length;

    const fillerRate = wordCount > 0 ? fillerWordCount / wordCount : 0;
    const vocabularyRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;
    const durationMinutes = 0.5; // fallback estimate (30 seconds)

const speedWPM =
  wordCount > 0
    ? Math.round(wordCount / durationMinutes)
    : 0;

    const scores = calculateSpeechScore(
      wordCount,
      fillerRate,
      speedWPM,
      vocabularyRatio
    );

    const speechRef = db.collection("speeches").doc(docId);
    const speechDoc = await speechRef.get();
    const userUid = speechDoc.exists ? speechDoc.data()?.userUid : null;

    // ======================
    // 🔥 FINAL FIRESTORE SCHEMA (IMPORTANT)
    // ======================
    await speechRef.set(
      {
        transcript,
        words: wordCount,
        fillerWords: fillerWordCount,
        speedWPM,
        vocabularyRatio,

        // ✅ STANDARD FIELD (frontend uses this)
        score: scores.total,

        clarityScore: scores.clarity,
        confidenceScore: scores.confidence,
        speedScore: scores.speed,

        feedback: scores.feedback,

        status: "completed",
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    logger.log("SUCCESS:", docId);

    if (userUid) {
      await db.collection("users").doc(userUid).update({
        points: admin.firestore.FieldValue.increment(10),
      });
    }

  } catch (error) {
    logger.error("ERROR:", error);
  }
});