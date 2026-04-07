import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import { SpeechClient } from "@google-cloud/speech";

admin.initializeApp();

const speechClient = new SpeechClient();

export const processSpeech = onObjectFinalized(
  { region: "us-central1" },
  async (event) => {
    try {
      const filePath = event.data?.name;
      const bucket = event.data?.bucket;

      if (!filePath || !bucket) {
        console.log("No filePath or bucket found");
        return;
      }

      // Only process speeches folder
      if (!filePath.startsWith("speeches/")) {
        console.log("Skipping file:", filePath);
        return;
      }

      const fileName = filePath.split("/")[1];
      const docId = fileName.split(".")[0];

      console.log("Processing file:", filePath);
      console.log("Doc ID:", docId);

      const docRef = admin.firestore().collection("speeches").doc(docId);

      // FINAL FIX: Let Google auto-detect encoding (no more MP3/WAV issues)
      const request = {
        audio: {
          uri: `gs://${bucket}/${filePath}`,
        },
        config: {
          languageCode: "en-US",
        },
      };

      // Call Speech-to-Text
      const [response] = await speechClient.recognize(request);

      const transcript =
        response.results
          ?.map((r) => r.alternatives?.[0]?.transcript || "")
          .join(" ") || "";

      console.log("Transcript:", transcript);

      // Metrics
      const words = transcript.split(/\s+/).filter(Boolean).length;

      const fillerWordsList = ["um", "uh", "like", "you know"];
      const fillerWords = transcript
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => fillerWordsList.includes(w)).length;

      const speedWPM = Math.min(120, words);
      const score = Math.max(0, 100 - fillerWords * 2);

      // FINAL FIX: use set with merge (prevents update failure)
      await docRef.set(
        {
          transcript,
          words,
          fillerWords,
          speedWPM,
          score,
          status: "completed",
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log("Score updated successfully");

    } catch (error: any) {
      console.error("ERROR:", error);

      try {
        const filePath = event.data?.name;

        if (filePath) {
          const fileName = filePath.split("/")[1];
          const docId = fileName.split(".")[0];

          await admin.firestore().collection("speeches").doc(docId).set(
            {
              status: "failed",
              error: error.message || "Unknown error",
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.error("Failed to update error status:", err);
      }
    }
  }
);