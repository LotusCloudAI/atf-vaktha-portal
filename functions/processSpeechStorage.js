const admin = require("firebase-admin");
const path = require("path");
const os = require("os");
const fs = require("fs");

const { convertToWav } = require("./utils/audioUtils");
const { transcribeAudio } = require("./services/speechService");
const { extractMetrics } = require("./utils/metricsUtils");

const { generateCoaching } = require("./ai/coachingEngine");
const { calculateScore } = require("./ai/scoringEngine");
const { updateSpeech } = require("./services/firestoreService");

exports.processSpeech = async (object) => {
  const filePath = object.name;

  if (!filePath || !filePath.includes("speeches/")) return;

  const fileName = path.basename(filePath);
  const speechId = fileName.split(".")[0];

  const bucket = admin.storage().bucket();
  const tempFilePath = path.join(os.tmpdir(), fileName);

  const db = admin.firestore();

  try {
    // 🔹 IDEMPOTENCY CHECK
    const doc = await db.collection("speeches").doc(speechId).get();

    if (doc.exists && doc.data().status === "completed") {
      console.log("Already processed:", speechId);
      return;
    }

    if (doc.exists && doc.data().status === "failed") {
      console.log("Retrying failed speech:", speechId);
    }

    // 🔹 DOWNLOAD
    await bucket.file(filePath).download({ destination: tempFilePath });

    // 🔹 CONVERT
    const wavPath = await convertToWav(tempFilePath);

    // 🔹 TRANSCRIBE
    const transcript = await transcribeAudio(wavPath);

    if (!transcript || transcript.length < 10) {
      throw new Error("Empty transcript");
    }

    // 🔹 METRICS
    const metrics = extractMetrics(transcript);

    // 🔹 AI COACHING
    const coaching = generateCoaching(metrics);

    // 🔹 SCORE
    const overallScore = calculateScore(metrics);

    // 🔹 UPDATE FIRESTORE
    await updateSpeech(speechId, {
      transcript,
      metrics,
      overallScore,
      feedback: coaching.feedback,
      analysis: coaching.analysis,
      status: "completed"
    });

    console.log(JSON.stringify({
      step: "completed",
      speechId,
      timestamp: new Date()
    }));

  } catch (error) {
    console.error("ERROR:", error);

    await updateSpeech(speechId, {
      status: "failed",
      error: error.message
    });

  } finally {
    // 🔹 CLEANUP
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }
};
