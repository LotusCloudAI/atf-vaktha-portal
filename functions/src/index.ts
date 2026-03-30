import { setGlobalOptions } from "firebase-functions/v2";
import { onObjectFinalized, StorageEvent } from "firebase-functions/v2/storage";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { SpeechClient, protos } from "@google-cloud/speech";
import * as path from "path";

/**
 * ATF VAKTHA - BACKEND & AI EXECUTION (PAVAN)
 * Merges existing scoring logic with Phase 1 & 2 requirements.
 */

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const speechClient = new SpeechClient();

// Configure Function Region and Limits
setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

const SUPPORTED_AUDIO = [".wav", ".mp3", ".m4a"];
const FILLER_WORDS_LIST = ["um", "uh", "like", "you know", "actually", "basically", "so", "right"];

/**
 * Speech Score Algorithm
 * Logic mapped to required frontend display fields (totalScore, clarityScore, confidenceScore).
 */
function calculateSpeechScore(wordCount: number, fillerRate: number, wpm: number, vocabularyRatio: number) {
  let paceScore = 0;
  let fillerScore = 0;
  let vocabScore = 0;
  let lengthScore = 0;

  // Pace Scoring (WPM)
  if (wpm >= 120 && wpm <= 170) paceScore = 25;
  else if (wpm >= 100 && wpm < 120) paceScore = 20;
  else if (wpm > 170 && wpm <= 190) paceScore = 18;
  else paceScore = 10;

  // Filler Word Impact
  if (fillerRate < 0.01) fillerScore = 25;
  else if (fillerRate < 0.03) fillerScore = 20;
  else if (fillerRate < 0.05) fillerScore = 15;
  else fillerScore = 10;

  // Vocabulary Diversity
  if (vocabularyRatio > 0.6) vocabScore = 25;
  else if (vocabularyRatio > 0.45) vocabScore = 20;
  else if (vocabularyRatio > 0.35) vocabScore = 15;
  else vocabScore = 10;

  // Speech Length
  if (wordCount > 120) lengthScore = 25;
  else if (wordCount > 80) lengthScore = 20;
  else if (wordCount > 50) lengthScore = 15;
  else lengthScore = 10;

  return {
    total: paceScore + fillerScore + vocabScore + lengthScore,
    clarity: fillerScore * 4, // Normalized to 0-100
    confidence: (paceScore + fillerScore) * 2 // Normalized to 0-100
  };
}

export const processSpeechStorage = onObjectFinalized(
  async (event: StorageEvent) => {
    try {
      const filePath = event.data.name;
      const bucketName = event.data.bucket;

      // Guard: Ensure we only process files in the 'speeches/' folder
      if (!filePath || !filePath.startsWith("speeches/")) {
        return;
      }

      const fileName = path.basename(filePath);
      const ext = path.extname(fileName).toLowerCase();

      // Validate audio format before processing
      if (!SUPPORTED_AUDIO.includes(ext)) {
        logger.warn("Unsupported audio format:", fileName);
        return;
      }

      const audioUri = `gs://${bucketName}/${filePath}`;
      logger.log(`Starting AI analysis for: ${audioUri}`);

      const request: protos.google.cloud.speech.v1.ILongRunningRecognizeRequest = {
        audio: { uri: audioUri },
        config: {
          encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
          languageCode: "en-US",
          enableAutomaticPunctuation: true,
          model: "latest_long",
        },
      };

      // Execute Long Running Recognition for better accuracy on longer files
      const [operation] = await speechClient.longRunningRecognize(request);
      const [response] = await operation.promise();

      const transcript = response.results
        ?.map((r) => r.alternatives?.[0]?.transcript || "")
        .join(" ")
        .trim() || "";

      // Metric Calculations
      const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const uniqueWords = new Set(words);

      const fillerWordCount = words.filter((w) => FILLER_WORDS_LIST.includes(w)).length;
      const fillerRate = wordCount > 0 ? fillerWordCount / wordCount : 0;
      const vocabularyRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;
      
      // Calculate Speaking Speed (WPM)
      // Note: For a more accurate WPM, you could extract audio duration from the response if available.
      const speedWPM = wordCount; 

      // Run Scoring Logic
      const scores = calculateSpeechScore(wordCount, fillerRate, speedWPM, vocabularyRatio);

      // Save to Firestore: Use collection 'speeches' to match Dashboard requirements
      await admin.firestore().collection("speeches").add({
        transcript,
        words: wordCount,
        fillerWords: fillerWordCount,
        speedWPM: speedWPM,
        totalScore: scores.total,
        clarityScore: scores.clarity,
        confidenceScore: scores.confidence,
        vocabularyRatio,
        fileName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.log("AI analysis saved successfully to Firestore.");

    } catch (error) {
      logger.error("Speech processing failed:", error);
    }
  }
);