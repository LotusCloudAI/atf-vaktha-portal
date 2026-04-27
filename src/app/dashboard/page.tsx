"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, } from "firebase/firestore";
import SpeechCard from "../../components/dashboard/SpeechCard";
import ProgressPanel from "../../components/dashboard/ProgressPanel";
import RecommendationsPanel from "../../components/dashboard/RecommendationsPanel";
import OrgSwitcher from "../../components/saas/OrgSwitcher";
import UsageCard from "../../components/saas/UsageCard";
import PlanCard from "../../components/saas/PlanCard";

export default function DashboardPage() {
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userLoaded, setUserLoaded] = useState(false);

  const [userPlan, setUserPlan] = useState<{ plan: string; usage: any } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setUserLoaded(false);
          setLoading(false);
          return;
        }

        setUserLoaded(true);

        // 1. FETCH SPEECHES
        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", user.uid)
        );

        const snap = await getDocs(q);
        const speechData = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        speechData.sort((a: any, b: any) => 
          (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setSpeeches(speechData);

        // 2. FETCH PROGRESS, RECOMMENDATIONS & USER PLAN/USAGE
        const [progressDoc, recDoc, userDoc] = await Promise.all([
          getDoc(doc(db, "userProgress", user.uid)),
          getDoc(doc(db, "userRecommendations", user.uid)),
          getDoc(doc(db, "users", user.uid)) // Assuming plan data is here
        ]);

        if (progressDoc.exists()) setProgress(progressDoc.data());
        if (recDoc.exists()) setRecommendations(recDoc.data());
        if (userDoc.exists()) setUserPlan(userDoc.data() as any);

      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (!userLoaded && !loading) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">Please login to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-10 text-center animate-pulse">Loading dashboard...</div>;
  }
  
  const plan = userPlan?.plan || "FREE";
  const usageCount = speeches.length;

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Speaking Dashboard</h1>
        </div>
        <OrgSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressPanel data={progress} />
            <RecommendationsPanel data={recommendations} />
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Speeches</h2>
              
              {/* LIMIT ENFORCEMENT ON BUTTON */}
              {plan === "FREE" && usageCount >= 5 ? (
                <button
                  disabled
                  className="bg-gray-400 text-white px-4 py-2 rounded shadow-sm cursor-not-allowed"
                >
                  Limit Reached
                </button>
              ) : (
                <a href="/dashboard/upload" className="bg-red-600 text-white px-4 py-2 rounded shadow-sm hover:bg-red-700 transition">
                  + New Speech
                </a>
              )}
            </div>

            {speeches.length === 0 ? (
              <div className="p-10 border-2 border-dashed rounded-xl text-center text-gray-400">
                No speeches uploaded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {speeches.map(s => (
                  <SpeechCard key={s.id} speech={s} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Subscription & Usage
            </h3>
            <div className="space-y-4">
              {/* DYNAMIC PLAN AND USAGE */}
              <PlanCard plan={plan} />
              <UsageCard usage={{ speeches: usageCount }} />
              
              {plan === "FREE" && usageCount >= 5 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-700 leading-relaxed">
                    You have reached your limit of 5 speeches. Please upgrade to continue uploading.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}