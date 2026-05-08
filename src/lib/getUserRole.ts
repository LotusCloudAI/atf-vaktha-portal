import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const getUserRole = async (uid: string) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data().role;
  }

  return "user";
};