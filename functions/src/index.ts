import { setGlobalOptions } from "firebase-functions/v2";
import { onObjectFinalized, StorageEvent } from "firebase-functions/v2/storage";
import * as logger from "firebase-functions/logger";

import * as admin from "firebase-admin";
import { SpeechClient, protos } from "@google-cloud/speech";

import * as fs from "fs";
import * as path from "path";

admin.initializeApp();

const speechClient = new SpeechClient();

/**
 * Global configuration
 */

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

/**
 * Allowed audio formats
 */

const SUPPORTED_AUDIO = [".wav", ".mp3", ".m4a"];

/**
 * Filler words dictionary
 */

const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "you",
  "know",
  "actually",
  "basically",
  "so",
  "right",
];

/**
 * Speech Score Algorithm
 */

function calculateSpeechScore(
  wordCount: number,
  fillerRate: number,
  wpm: number,
  vocabularyRatio: number
) {

  let paceScore = 0;
  let fillerScore = 0;
  let vocabScore = 0;
  let lengthScore = 0;

  /** Speaking Pace */

  if (wpm >= 120 && wpm <= 170) paceScore = 25;
  else if (wpm >= 100 && wpm < 120) paceScore = 20;
  else if (wpm > 170 && wpm <= 190) paceScore = 18;
  else paceScore = 10;

  /** Filler words */

  if (fillerRate < 0.01) fillerScore = 25;
  else if (fillerRate < 0.03) fillerScore = 20;
  else if (fillerRate < 0.05) fillerScore = 15;
  else fillerScore = 10;

  /** Vocabulary diversity */

  if (vocabularyRatio > 0.6) vocabScore = 25;
  else if (vocabularyRatio > 0.45) vocabScore = 20;
  else if (vocabularyRatio > 0.35) vocabScore = 15;
  else vocabScore = 10;

  /** Speech length */

  if (wordCount > 120) lengthScore = 25;
  else if (wordCount > 80) lengthScore = 20;
  else if (wordCount > 50) lengthScore = 15;
  else lengthScore = 10;

  return paceScore + fillerScore + vocabScore + lengthScore;
}

/**
 * AI Feedback Generator
 */

function generateFeedback(
  fillerRate: number,
  wpm: number
) {

  if (fillerRate > 0.05)
    return "Reduce filler words for stronger delivery.";

  if (wpm > 170)
    return "Speaking speed is high. Consider slowing down.";

  if (wpm < 110)
    return "Speech pacing is slow. Try increasing energy.";

  return "Excellent delivery. Maintain this pace.";
}

/**
 * ATF Vaktha Speech Processing
 */

export const processSpeechStorage = onObjectFinalized(
  async (event: StorageEvent) => {

    let tempFile = "";

    try {

      const filePath = event.data.name;
      const bucketName = event.data.bucket;

      if (!filePath) {
        logger.warn("No file path found.");
        return;
      }

      /**
       * Only process speeches folder
       */

      if (!filePath.startsWith("speeches/")) {
        logger.log("Ignoring non speech file:", filePath);
        return;
      }

      logger.log("Processing speech:", filePath);

      const bucket = admin.storage().bucket(bucketName);
      const file = bucket.file(filePath);

      const fileName = path.basename(filePath);
      const ext = path.extname(fileName).toLowerCase();

      /**
       * Validate audio format
       */

      if (!SUPPORTED_AUDIO.includes(ext)) {
        logger.warn("Unsupported audio format:", fileName);
        return;
      }

      /**
       * Download to temp
       */

      tempFile = `/tmp/${fileName}`;

      await file.download({
        destination: tempFile,
      });

      logger.log("File downloaded:", tempFile);

      /**
       * Speech-to-Text request
       */

      const audioUri = `gs://${bucketName}/${filePath}`;

      const request: protos.google.cloud.speech.v1.ILongRunningRecognizeRequest =
        {
          audio: {
            uri: audioUri,
          },
          config: {
            encoding:
              protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding
                .LINEAR16,
            languageCode: "en-US",
            enableAutomaticPunctuation: true,
            model: "latest_long",
          },
        };

      const [operation] =
        await speechClient.longRunningRecognize(request);

      const [response] = await operation.promise();

      const transcript =
        response.results
          ?.map((r) => r.alternatives?.[0]?.transcript || "")
          .join(" ")
          .trim() || "";

      logger.log("Transcript created");

      /**
       * Word processing
       */

      const words = transcript
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      const wordCount = words.length;

      /**
       * Filler words
       */

      const fillerWordCount = words.filter((w) =>
        FILLER_WORDS.includes(w)
      ).length;

      const fillerRate =
        wordCount > 0
          ? Number((fillerWordCount / wordCount).toFixed(3))
          : 0;

      /**
       * Vocabulary richness
       */

      const uniqueWords = new Set(words);

      const vocabularyRatio =
        wordCount > 0
          ? Number((uniqueWords.size / wordCount).toFixed(2))
          : 0;

      /**
       * Speaking speed (approximate)
       */

      const wordsPerMinute =
        wordCount > 0
          ? Math.round(wordCount / 1)
          : 0;

      /**
       * Speech Score
       */

      const speechScore = calculateSpeechScore(
        wordCount,
        fillerRate,
        wordsPerMinute,
        vocabularyRatio
      );

      /**
       * AI feedback
       */

      const aiFeedback = generateFeedback(
        fillerRate,
        wordsPerMinute
      );

      /**
       * Extract metadata
       */

      const parts = filePath.split("/");

      const userId = parts[1] || "unknown";

      const speechFile = parts[2] || fileName;

      /**
       * Save to Firestore
       */

      const doc = await admin
        .firestore()
        .collection("transcripts")
        .add({

          userId,
          speechFile,

          transcriptText: transcript,

          wordCount,
          fillerWordCount,
          fillerRate,

          wordsPerMinute,
          vocabularyRatio,

          speechScore,
          aiFeedback,

          createdAt:
            admin.firestore.FieldValue.serverTimestamp(),
        });

      logger.log("Transcript saved:", doc.id);

    } catch (error) {

      logger.error("Speech processing failed:", error);

    } finally {

      try {

        if (tempFile && fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }

      } catch (cleanupError) {

        logger.warn("Temp cleanup failed:", cleanupError);

      }

    }

  }
);