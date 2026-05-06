import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import { SpeechClient } from "@google-cloud/speech";
import * as path from "path";

admin.initializeApp();
const client = new SpeechClient();

export const processSpeech = onObjectFinalized(async (event) => {
  const filePath = event.data.name;
  const bucketName = event.data.bucket;

  // ✅ VALIDATION
  if (!filePath || !filePath.startsWith("speeches/")) {
    console.log("Skipping non-speech file:", filePath);
    return;
  }

  console.log("🎯 Processing:", filePath);

  try {
    const bucket = admin.storage().bucket(bucketName);

    // ✅ FIX 1: CORRECT STRING TEMPLATE (YOU MISSED BACKTICKS BEFORE)
    const gcsUri = `gs://${bucket.name}/${filePath}`;

    // ✅ FIX 2: AUTO DETECT FILE TYPE
    const isMp3 = filePath.toLowerCase().endsWith(".mp3");

    // ✅ FINAL FIX: REMOVE protos + REMOVE sampleRate
    const request: any= {
      audio: {
        uri: gcsUri,
      },
      config: {
        encoding: isMp3 ? "MP3" : "LINEAR16",
        languageCode: "en-US",
        enableAutomaticPunctuation: true,
      },
    };

    console.log("🚀 Sending to Speech API:", gcsUri);

    const [response]: any = await client.recognize(request);

    console.log("🧠 RAW RESPONSE:", JSON.stringify(response));

    // ✅ TRANSCRIPT EXTRACTION
    const transcript =
      response?.results
        ?.map((r: any) => r.alternatives?.[0]?.transcript || "")
        .join(" ")
        .trim() || "";

    if (!transcript) {
      console.log("❌ No transcript — stopping");
      return;
    }

    console.log("✅ Transcript OK");

    // ✅ METRICS
    const words = transcript.split(/\s+/).length;

    const fillerWords =
      transcript.match(/\b(um|uh|like|you know)\b/gi)?.length || 0;

    const durationMinutes = words > 0 ? words / 130 : 1;
    const wpm = Math.round(words / durationMinutes);

    const clarityScore = Math.max(0, 100 - fillerWords * 2);
    const confidenceScore = Math.max(0, 100 - fillerWords * 3);

    let speedScore = 100;
    if (wpm < 110) speedScore = Math.max(0, 100 - (110 - wpm));
    else if (wpm > 160) speedScore = Math.max(0, 100 - (wpm - 160));

    const score = Math.round(
      (clarityScore + confidenceScore + speedScore) / 3
    );

    // ✅ FIX 3: DOC ID MATCH
    const docId = path.basename(filePath).split(".")[0];

    console.log("📝 Updating Firestore doc:", docId);

    await admin.firestore().collection("speeches").doc(docId).update({
      transcript,
      words,
      fillerWords,
      wpm,
      score,
      status: "completed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("🎉 SUCCESS:", docId);
  } catch (error) {
    console.error("❌ ERROR in processSpeech:", error);
  }
});