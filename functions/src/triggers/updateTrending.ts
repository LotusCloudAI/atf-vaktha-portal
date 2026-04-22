import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "../config/firebase";
import { calculateTrendingScore } from "../utils/trending";

export const updateTrendingOnSpeechCreate = onDocumentCreated({
  document: "speeches/{speechId}",
  region: "us-central1",
  memory: "512MiB"
}, async (event) => {
  const snap = event.data;
  if (!snap) return;
  
  const data = snap.data();
  if (!data?.overallScore || !data?.createdAt) return;

  const userStatsDoc = await db
    .collection("userStats")
    .doc(data.userUid)
    .get();

  const userAvgScore = userStatsDoc.data()?.avgScore || 50;

  const trendingScore = calculateTrendingScore({
    overallScore: data.overallScore,
    createdAt: data.createdAt,
    userAvgScore,
  });

  await snap.ref.update({ trendingScore });
});