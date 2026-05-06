import { setGlobalOptions } from "firebase-functions/v2";
import { onObjectFinalized, StorageEvent } from "firebase-functions/v2/storage";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as path from "path";
import { SpeechClient, protos } from "@google-cloud/speech";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const speechClient = new SpeechClient();

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

const SUPPORTED_AUDIO = [".wav", ".mp3", ".m4a"];
const FILLER_WORDS_LIST = ["um", "uh", "like", "you know", "actually", "basically", "so", "right"];

/**
 * ✅ SCORING FUNCTION (FINAL)
 */
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

  let feedback = "Great job! Keep practicing.";
  if (fillerRate > 0.05) feedback = "Reduce filler words.";
  else if (wpm > 170) feedback = "Slow down slightly.";
  else if (wpm < 100) feedback = "Speak with more energy.";

  return {
    total: paceScore + fillerScore + vocabScore + lengthScore,
    clarity: fillerScore * 4,
    confidence: (paceScore + fillerScore) * 2,
    speed: speedScore,
    feedback,
  };
}

/**
 * ✅ FINAL PRODUCTION FUNCTION (WITH SPEECH API)
 */
export const processSpeechStorage = onObjectFinalized(async (event: StorageEvent) => {
  try {
    const filePath = event.data.name;
    const bucketName = event.data.bucket;

    if (!filePath || !filePath.startsWith("speeches/")) {
      logger.log("Skipping non-speech file:", filePath);
      return;
    }

    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();

    if (!SUPPORTED_AUDIO.includes(ext)) {
      logger.warn("Unsupported format:", fileName);
      return;
    }

    const docId = fileName.replace(ext, "");

    if (!docId) {
      logger.error("Invalid docId");
      return;
    }

    logger.log("Processing:", docId);

    const audioUri = `gs://${bucketName}/${filePath}`;

    /**
     * ✅ AUTO ENCODING BASED ON FILE TYPE
     */
    const encoding =
      ext === ".wav"
        ? protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16
        : ext === ".mp3"
        ? protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3
        : protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED;

    const request: protos.google.cloud.speech.v1.ILongRunningRecognizeRequest = {
      audio: { uri: audioUri },
      config: {
        encoding,
        languageCode: "en-US",
        enableAutomaticPunctuation: true,
        model: "latest_long",
      },
    };

    /**
     * ✅ SPEECH-TO-TEXT
     */
    const [operation] = await speechClient.longRunningRecognize(request);
    const [response] = await operation.promise();

    const transcript =
      response.results
        ?.map((r) => r.alternatives?.[0]?.transcript || "")
        .join(" ")
        .trim() || "";

    /**
     * ❌ FAIL SAFE (IMPORTANT)
     */
    if (!transcript) {
      await db.collection("speeches").doc(docId).set(
        {
          status: "failed",
          error: "No transcript generated",
        },
        { merge: true }
      );
      return;
    }

    /**
     * ✅ METRICS
     */
    const wordsArray = transcript.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = wordsArray.length;
    const uniqueWords = new Set(wordsArray);

    const fillerWordCount = wordsArray.filter((w) => FILLER_WORDS_LIST.includes(w)).length;
    const fillerRate = wordCount > 0 ? fillerWordCount / wordCount : 0;
    const vocabularyRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;

    const speedWPM = wordCount / 2;

    const scores = calculateSpeechScore(wordCount, fillerRate, speedWPM, vocabularyRatio);

    const speechRef = db.collection("speeches").doc(docId);
    const speechDoc = await speechRef.get();
    const userId = speechDoc.exists ? speechDoc.data()?.userUid : null;

    /**
     * ✅ SAVE RESULTS
     */
    await speechRef.set(
      {
        transcript,
        words: wordCount,
        fillerWords: fillerWordCount,
        speedWPM,
        totalScore: scores.total,
        clarityScore: scores.clarity,
        confidenceScore: scores.confidence,
        speedScore: scores.speed,
        feedback: scores.feedback,
        vocabularyRatio,
        status: "completed",
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    logger.log("SUCCESS:", docId);

    /**
     * ✅ GAMIFICATION
     */
    if (userId) {
      await db.collection("users").doc(userId).update({
        points: admin.firestore.FieldValue.increment(10),
      });
      logger.log("Points awarded:", userId);
    }

  } catch (error: any) {
    logger.error("Processing failed:", error);

    try {
      const filePath = event.data.name || "";
      const fileName = filePath.split("/").pop() || "";
      const docId = fileName.split(".")[0];

      if (!docId) return;

      await db.collection("speeches").doc(docId).update({
        status: "failed",
        error: error.message,
      });

    } catch (e) {
      logger.error("Failed to update error state:", e);
    }
  }
});