import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createUserIfNotExists = async (user: any) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      role: "member",
      // Phase 7: Gamification Defaults
      points: 0,
      level: 1
    });
  }
};