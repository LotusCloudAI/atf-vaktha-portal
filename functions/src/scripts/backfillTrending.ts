import { db } from "../config/firebase";
import { calculateTrendingScore } from "../utils/trending";

async function run() {
  console.log("Starting backfill...");
  const snapshot = await db.collection("speeches").get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.overallScore) continue;

    const trendingScore = calculateTrendingScore({
      overallScore: data.overallScore,
      createdAt: data.createdAt,
      userAvgScore: 50, // Default for backfill
    });

    await doc.ref.update({ trendingScore });
    console.log(`Updated speech: ${doc.id}`);
  }

  console.log("Backfill complete [cite: 465]");
}

run();