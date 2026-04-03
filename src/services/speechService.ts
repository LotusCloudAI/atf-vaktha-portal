import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export const getUserStats = async (uid: string) => {
  const q = query(collection(db, "speeches"), where("userUid", "==", uid));
  const snapshot = await getDocs(q);

  let total = 0;
  let count = 0;
  let lastScore = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.speechScore) {
      total += data.speechScore;
      count++;
    }
  });

  const latestQuery = query(
    collection(db, "speeches"),
    where("userUid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const latestSnap = await getDocs(latestQuery);

  latestSnap.forEach((doc) => {
    const data = doc.data();
    lastScore = data.speechScore || 0;
  });

  return {
    totalSpeeches: snapshot.size,
    avgScore: count ? Math.round(total / count) : 0,
    lastScore,
  };
};
