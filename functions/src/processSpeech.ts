import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import { SpeechClient } from "@google-cloud/speech";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

if (!admin.apps.length) admin.initializeApp();
const client = new SpeechClient();
if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

export const processSpeechStorage = onObjectFinalized({
  // 🔥 HARD ENFORCEMENT OF RESOURCES
  memory: "1GiB", 
  timeoutSeconds: 300,
  cpu: 1,
}, async (event) => {
  const filePath = event.data.name;
  if (!filePath || !filePath.startsWith("speeches/")) return;

  const bucket = admin.storage().bucket(event.data.bucket);
  const fileName = path.basename(filePath);
  const baseName = path.parse(fileName).name;
  
  const tempRaw = path.join(os.tmpdir(), `raw_${Date.now()}_${fileName}`);
  const tempWav = path.join(os.tmpdir(), `final_${baseName}.wav`);

  try {
    console.log(`🚀 VAKTHA NORMALIZING: ${fileName}`);
    await bucket.file(filePath).download({ destination: tempRaw });

    // Ensure the raw file actually downloaded
    const rawStats = fs.statSync(tempRaw);
    console.log(`📥 Downloaded ${rawStats.size} bytes`);

    // FFmpeg Normalization to 16kHz Mono WAV
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempRaw)
        .toFormat('wav')
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('start', (cmd) => console.log('FFmpeg CMD:', cmd))
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(tempWav);
    });

    const audioBytes = fs.readFileSync(tempWav).toString("base64");

    // Speech-to-Text (Telugu + English)
    const [response] = await client.recognize({
      audio: { content: audioBytes },
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "te-IN", 
        alternativeLanguageCodes: ["en-US"],
        enableAutomaticPunctuation: true,
        model: "latest_long",
      },
    });

    const transcript = response.results?.map(r => r.alternatives?.[0].transcript).join(" ") || "";
    const words = transcript.split(/\s+/).filter(w => w.length > 0).length;
    const fillerWords = (transcript.match(/\b(um|uh|like|you know|ante|ante-ippudu)\b/gi) || []).length;
    
    // Calculate WPM based on a 16kHz Mono file size (approx 32KB per second)
    const wavStats = fs.statSync(tempWav);
    const durationSec = wavStats.size / 32000;
    const wpm = durationSec > 0 ? Math.round(words / (durationSec / 60)) : 0;

    await admin.firestore().collection("speeches").doc(baseName).set({
      transcript,
      metrics: { words, fillerWords, wpm },
      overallScore: words > 0 ? Math.max(0, 100 - (fillerWords * 4)) : 0,
      status: "completed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`✅ SUCCESS: Dashboard ID ${baseName} updated.`);

  } catch (error) {
    console.error("❌ ERROR:", error);
  } finally {
    if (fs.existsSync(tempRaw)) fs.unlinkSync(tempRaw);
    if (fs.existsSync(tempWav)) fs.unlinkSync(tempWav);
  }
});