import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import { SpeechClient } from "@google-cloud/speech";

admin.initializeApp();

const client = new SpeechClient();

export const processSpeech = onObjectFinalized(async (event) => {
  const filePath = event.data.name;

  if (!filePath || !filePath.includes("speeches/")) {
    console.log("Not a speech file, skipping...");
    return;
  }

  console.log("Processing file:", filePath);

  try {
    const bucket = admin.storage().bucket(event.data.bucket);
    const file = bucket.file(filePath);

    const [audioBytes] = await file.download();

    const audio = {
      content: audioBytes.toString("base64"),
    };

    const config = {
      encoding: "LINEAR16" as const,
      languageCode: "en-US",
    };

    const request = {
      audio,
      config,
    };

    // 🔥 Google Speech-to-Text
    const [response] = await client.recognize(request);

    // ✅ FIXED transcript parsing
    const transcript =
      response.results
        ?.map((r: any) => r.alternatives?.[0]?.transcript || "")
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import speech from "@google-cloud/speech";

// Initialize Firebase Admin (prevent re-init in hot reload)
initializeApp();

// Initialize Speech Client
const speechClient = new speech.SpeechClient();

export const processSpeech = onObjectFinalized(async (event) => {
  const object = event.data;

  console.log("FUNCTION TRIGGERED");

  const fileName = object.name;

  if (!fileName) {
    console.log("No file name found");
    return;
  }

  console.log("File Name:", fileName);

  // ============================
  // SAFE docId extraction
  // ============================
  const parts = fileName.split("/");
  const file = parts[parts.length - 1];
  const docId = file.split(".")[0];

  console.log("Extracted docId:", docId);

  const db = getFirestore();

  try {
    // ============================
    // BUILD GCS URI (FIXED)
    // ============================
    const bucket = object.bucket;

    if (!bucket) {
      console.log("No bucket found");
      return;
    }

    const gcsUri = `gs://${bucket}/${fileName}`; // ✅ FIXED

    console.log("GCS URI:", gcsUri);

    // ============================
    // SPEECH-TO-TEXT REQUEST
    // ============================
    const [operation] = await speechClient.longRunningRecognize({
      audio: {
        uri: gcsUri,
      },
      config: {
        encoding: "MP3",
        languageCode: "en-US",
      },
    });

    console.log("Processing audio...");

    const [response] = await operation.promise();

    // ============================
    // EXTRACT TRANSCRIPT (SAFE)
    // ============================
    const transcript =
      response.results
        ?.map((result: any) => result.alternatives?.[0]?.transcript || "")
        .join(" ")
        .trim() || "";

    console.log("Transcript:", transcript);

    // 🔥 ANALYTICS
    const words = transcript ? transcript.split(/\s+/).length : 0;

    const fillerMatches =
      transcript.match(/\b(um|uh|like|you know)\b/gi) || [];

    const fillerWords = fillerMatches.length;

    const speedWPM = words;
    const speechScore = Math.max(0, 100 - fillerWords * 2);

    console.log("Analytics:", {
      words,
      fillerWords,
      speedWPM,
      speechScore,
    });

    // 🔍 FIND DOCUMENT
    const speechDocs = await admin
      .firestore()
      .collection("speeches")
      .get();

    for (const doc of speechDocs.docs) {
      const data = doc.data();

      if (data.audioUrl && data.audioUrl.includes(filePath)) {
        console.log("Updating document:", doc.id);

        await doc.ref.update({
          transcript,
          words,
          fillerWords,
          speedWPM,
          speechScore,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "completed",
        });
      }
    }

    console.log("Processing completed");

  } catch (error) {
    console.error("Error processing speech:", error);
    // ============================
    // SIMPLE ANALYTICS
    // ============================
    const words = transcript.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    let score = 0;

    if (wordCount > 0) {
      score = Math.min(100, Math.round((wordCount / 120) * 100));
    }

    console.log("Word Count:", wordCount);
    console.log("Score:", score);

    // ============================
    // UPDATE FIRESTORE
    // ============================
    await db.collection("speeches").doc(docId).update({
      transcript,
      wordCount,
      score,
      status: "completed",
      updatedAt: new Date(),
    });

    console.log("Firestore updated successfully");

  } catch (error: any) {
    console.error("Speech processing failed:", error);

    // ============================
    // FAIL-SAFE UPDATE
    // ============================
    try {
      await db.collection("speeches").doc(docId).update({
        status: "failed",
        error: error?.message || "Unknown error",
      });
    } catch (updateError) {
      console.error("Firestore fail-safe update failed:", updateError);
    }
  }
});