const speech = require("@google-cloud/speech");
const fs = require("fs");

const client = new speech.SpeechClient();

/**
 * Transcribes a local WAV file using Google Cloud Speech-to-Text v1.
 */
exports.transcribeAudio = async (filePath) => {
  // Convert local file to base64 string for the API [cite: 156]
  const audioBytes = fs.readFileSync(filePath).toString("base64");

  const request = {
    audio: { content: audioBytes },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "en-US" // Optimized for Phase 8 language requirements [cite: 160-162]
    }
  };

  const [response] = await client.recognize(request);

  // Combine all transcript fragments into one string [cite: 166-168]
  return response.results
    .map(r => r.alternatives[0].transcript)
    .join("\n");
};