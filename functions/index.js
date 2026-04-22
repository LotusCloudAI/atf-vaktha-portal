const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const { processSpeech } = require("./processSpeechStorage");

exports.processSpeechStorage = functions.storage
  .object()
  .onFinalize(async (object) => {
    return processSpeech(object);
  });
