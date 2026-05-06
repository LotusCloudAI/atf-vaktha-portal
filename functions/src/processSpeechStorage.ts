import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

export const processSpeechStorage = onObjectFinalized(async (event) => {
  try {
    const filePath = event.data.name;

    if (!filePath || !filePath.startsWith("speeches/")) {
      logger.log("Ignoring non-speech file:", filePath);
      return;
    }

    const fileName = filePath.split("/").pop() || "";
    const docId = fileName.split(".")[0];

    if (!docId) {
      logger.error("Invalid docId");
      return;
    }

    logger.log("Processing docId:", docId);

    // TEMP PROCESSING (STABLE)
    const transcript = "This is a test speech for debugging";

    const words = transcript.split(" ").length;
    const fillerWords = 2;
    const wpm = 120;

    const metrics = {
      words,
      fillerWords,
      wpm,
      clarityScore: 80,
      speedScore: 75,
    };

    const overallScore = 78;

    await db.collection("speeches").doc(docId).update({
      transcript,
      metrics,
      overallScore,
      status: "completed",
      updatedAt: new Date(),
    });

    logger.log("SUCCESS:", docId);

  } catch (error: any) {
    logger.error("ERROR:", error);

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
      logger.error("FAILED TO UPDATE ERROR STATE:", e);
    }
  }
});