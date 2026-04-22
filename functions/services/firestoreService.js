const admin = require("firebase-admin");

/**
 * Updates the specific speech document with AI metrics and coaching.
 * Uses merge: true to avoid overwriting existing metadata.
 */
exports.updateSpeech = async (speechId, data) => {
  const db = admin.firestore();

  await db.collection("speeches").doc(speechId).set({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp() // Sets accurate server time [cite: 227-228]
  }, { merge: true });
};