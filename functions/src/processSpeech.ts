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

    const transcript =
      response.results
        ?.map((r: any) => r.alternatives?.[0]?.transcript || "")
        .join(" ")
        .trim() || "";

    console.log("Transcript:", transcript);

    // 🔥 ANALYTICS
    const words = transcript ? transcript.split(/\s+/).length : 0;

    const fillerMatches =
      transcript.match(/\b(um|uh|like|you know)\b/gi) || [];

    const fillerWords = fillerMatches.length;

    // Improved WPM estimation (basic fallback)
    const durationMinutes = words > 0 ? words / 130 : 1;
    const speedWPM = Math.round(words / durationMinutes);

    // Phase 2 scoring
    const clarityScore = Math.max(0, 100 - fillerWords * 2);
    const confidenceScore = Math.max(0, 100 - fillerWords * 3);

    let speedScore = 100;
    if (speedWPM < 110) {
      speedScore = Math.max(0, 100 - (110 - speedWPM));
    } else if (speedWPM > 160) {
      speedScore = Math.max(0, 100 - (speedWPM - 160));
    }

    let feedback = "Great job! Your speech was clear and well-paced.";
    if (fillerWords > 5) {
      feedback =
        "Try to reduce filler words like 'um' and 'uh' to improve your clarity.";
    } else if (speedWPM > 160) {
      feedback =
        "You are speaking a bit too fast. Try slowing down for better clarity.";
    } else if (speedWPM < 110 && words > 20) {
      feedback =
        "Your pace is slightly slow. Try speaking with more energy.";
    }

    const speechScore = Math.round(
      (clarityScore + confidenceScore + speedScore) / 3
    );

    console.log("Analytics:", {
      words,
      fillerWords,
      speedWPM,
      speechScore,
    });

    // 🔥 IMPORTANT FIX (DO NOT LOOP ALL DOCS)
    const docId = filePath.split("/")[1]?.split(".")[0];

    if (!docId) {
      console.log("Invalid docId, skipping...");
      return;
    }

    console.log("Updating document:", docId);

    await admin.firestore().collection("speeches").doc(docId).update({
      transcript,
      words,
      fillerWords,
      speedWPM,
      clarityScore,
      confidenceScore,
      speedScore,
      speechScore,
      feedback,
      status: "completed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Processing completed");
  } catch (error) {
    console.error("Error processing speech:", error);
  }
});