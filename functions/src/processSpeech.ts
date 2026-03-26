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
  }
});