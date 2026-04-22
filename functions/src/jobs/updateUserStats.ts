import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "../config/firebase";
import { calculateUserStats } from "../utils/userStats";

export const updateUserStats = onSchedule({
  schedule: "every 1 hours",
  region: "us-central1"
}, async () => {
  const users = await db.collection("users").get();

  for (const user of users.docs) {
    const speechesSnap = await db
      .collection("speeches")
      .where("userUid", "==", user.id)
      .orderBy("createdAt")
      .get();

    const speeches = speechesSnap.docs.map(d => d.data());
    const stats = calculateUserStats(speeches);

    await db.collection("userStats")
      .doc(user.id)
      .set(stats);
  }
});