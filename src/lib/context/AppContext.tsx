"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [plan, setPlan] = useState("FREE");
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(u);

      const unsubUser = onSnapshot(
        doc(db, "users", u.uid),
        (userSnap) => {
          const org = userSnap.data()?.orgId;
          setOrgId(org);

          if (!org) {
            setLoading(false);
            return;
          }

          const unsubOrg = onSnapshot(
            doc(db, "organizations", org),
            (orgSnap) => {
              const data = orgSnap.data();
              setPlan(data?.plan || "FREE");
              setUsage(data?.usage || {});
              setLoading(false);
            },
            () => {
              setError("Org access denied");
              setLoading(false);
            }
          );

          return () => unsubOrg();
        },
        () => {
          setError("User access error");
          setLoading(false);
        }
      );

      return () => unsubUser();
    });

    return () => unsubAuth();
  }, []);

  return (
    <AppContext.Provider value={{ user, orgId, plan, usage, loading, error }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
