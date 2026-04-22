import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "../config/firebase";

export const updateLeaderboards = onSchedule({
  schedule: "every 30 minutes",
  region: "us-central1"
}, async () => {
  const snapshot = await db
    .collection("speeches")
    .orderBy("trendingScore", "desc")
    .limit(20)
    .get();

  const topSpeeches = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  await db.collection("leaderboards")
    .doc("global")
    .set({
      topSpeeches,
      updatedAt: new Date(),
    });
});