"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const useUserRole = () => {
  const [role, setRole] = useState<string>("member");

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      setRole(snap.data()?.role || "member");
    };

    fetchRole();
  }, []);

  return role;
};
