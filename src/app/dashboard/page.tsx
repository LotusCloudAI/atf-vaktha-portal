// "use client";

// import { useEffect, useState } from "react";
// import { auth, db } from "@/lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { collection, query, where, getDocs } from "firebase/firestore";

// export default function DashboardPage() {
//   const [speeches, setSpeeches] = useState<any[]>([]);
//   const [checking, setChecking] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         setChecking(false);
//         return;
//       }

//       try {
//         const q = query(
//           collection(db, "speeches"),
//           where("userUid", "==", user.uid)
//         );

//         const snapshot = await getDocs(q);

//         const speechList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         setSpeeches(speechList);
//       } catch (error) {
//         console.error("Error loading speeches:", error);
//       }

//       setChecking(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const avgScore =
//     speeches.reduce((sum, s) => sum + (s.analytics?.score || 0), 0) /
//     (speeches.length || 1);

//   if (checking) {
//     return <div className="p-10 text-gray-500">Loading dashboard...</div>;
//   }

//   return (
//     <main className="p-10 bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>

//       {/* Stats Overview Card */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
//             Total Speeches
//           </p>
//           <p className="text-4xl font-bold text-blue-600 mt-1">
//             {speeches.length}
//           </p>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
//             Average Score
//           </p>
//           <p className="text-4xl font-bold text-green-600 mt-1">
//             {Math.round(avgScore)}%
//           </p>
//         </div>
//       </div>

//       {speeches.length === 0 && (
//         <p className="mt-10 text-gray-500 italic">
//           No data available. Upload a speech to see your progress!
//         </p>
//       )}
//     </main>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "speeches"));
        setSpeeches(snapshot.docs.map(doc => doc.data()));
      } catch {
        console.log("Error loading data");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1>Analytics</h1>

      {speeches.map((s: any, i) => (
        <div key={i} className="border p-4 mt-4">
          <p>Words: {s.words}</p>
          <p>Filler: {s.fillerWords}</p>
          <p>Speed: {s.speedWPM}</p>
          <p>Total Score: {s.totalScore}</p>
          <p>Clarity: {s.clarityScore}</p>
          <p>Confidence: {s.confidenceScore}</p>
        </div>
      ))}
    </div>
  );
}
