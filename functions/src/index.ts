import { setGlobalOptions } from "firebase-functions/v2";
import { onObjectFinalized, StorageEvent } from "firebase-functions/v2/storage";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { SpeechClient, protos } from "@google-cloud/speech";
import * as path from "path";

// Initialize Firebase Admin once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const speechClient = new SpeechClient();
const db = admin.firestore();

// Global configuration for v2 functions
setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

const SUPPORTED_AUDIO = [".wav", ".mp3", ".m4a"];
const FILLER_WORDS_LIST = ["um", "uh", "like", "you know", "actually", "basically", "so", "right"];

/**
 * PHASE 3 ENHANCED SCORING ENGINE
 */
function calculateEnhancedMetrics(wordCount: number, fillerCount: number, wpm: number) {
  // Clarity Score: Starts at 100, drops 2 points per filler word
  const clarityScore = Math.max(0, 100 - fillerCount * 2);

  // Speed Score: Ideal pace is 120-160 WPM
  let speedScore = 70;
  if (wpm >= 120 && wpm <= 160) speedScore = 100;
  else if ((wpm >= 100 && wpm < 120) || (wpm > 160 && wpm <= 180)) speedScore = 85;

  // Overall Score: Weighted average (60% Clarity, 40% Speed)
  const overallScore = Math.round(clarityScore * 0.6 + speedScore * 0.4);

  // AI Feedback Engine
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

  if (wordCount < 50) {
    weaknesses.push("Speech content is too short");
    suggestions.push("Expand with more supporting ideas");
  }

  return {
    overallScore,
    clarityScore,
    speedScore,
    aiFeedback: { strengths, weaknesses, suggestions }
  };
}

// ==========================================
// MAIN EXPORT (Triggered by Storage)
// ==========================================
export const processSpeechStorage = onObjectFinalized(async (event: StorageEvent) => {
  try {
    const filePath = event.data.name;
    const bucketName = event.data.bucket;

    if (!filePath || !filePath.startsWith("speeches/")) return;

    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();
    
    // docId extraction: speeches/abc.wav -> abc
    const docId = fileName.replace(ext, "");

    if (!SUPPORTED_AUDIO.includes(ext)) {
      logger.warn("Unsupported format:", ext);
      return;
    }

    const audioUri = `gs://${bucketName}/${filePath}`;
    logger.log(`Processing: ${audioUri}`);

    // Encoding Logic
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

    const transcript = response.results
      ?.map(r => r.alternatives?.[0]?.transcript || "")
      .join(" ")
      .trim() || "";

    if (!transcript) {
      logger.warn("Empty transcript for:", docId);
      return;
    }

    // Phase 3 Metrics
    const wordsArray = transcript.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = wordsArray.length;
    const fillerCount = wordsArray.filter(w => FILLER_WORDS_LIST.includes(w)).length;

    // Duration extraction: use metadata if available, else default to 60s
    const audioDuration = Number(event.data.metadata?.duration) || 60;
    const durationMinutes = Math.max(audioDuration / 60, 0.5);
    const speedWPM = Math.round(wordCount / durationMinutes);

    // Calculate Enhanced Scores
    const results = calculateEnhancedMetrics(wordCount, fillerCount, speedWPM);

    const speechRef = db.collection("speeches").doc(docId);
    const speechDoc = await speechRef.get();
    const userUid = speechDoc.exists ? speechDoc.data()?.userUid : null;

    // FIRESTORE FINAL PHASE 3 SCHEMA
    await speechRef.set(
      {
        transcript,
        
        // TOP-LEVEL FIELDS FOR PORTAL UI
        words: wordCount,
        wpm: speedWPM,
        speedWPM: speedWPM, 
        fillerWords: fillerCount,
        score: results.overallScore,

        // Nested metrics
        metrics: {
          words: wordCount,
          wpm: speedWPM,
          fillerWords: fillerCount,
          clarityScore: results.clarityScore,
          speedScore: results.speedScore,
        },
        
        overallScore: results.overallScore,
        aiFeedback: results.aiFeedback,
        scoringVersion: "v2-phase3",
        status: "completed",
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (userUid) {
      await db.collection("users").doc(userUid).update({
        points: admin.firestore.FieldValue.increment(10),
      });
    }

    logger.log("SUCCESS: Phase 3 processing complete for", docId);

  } catch (error: any) {
    logger.error("ERROR in processSpeechStorage:", error);
  }
});