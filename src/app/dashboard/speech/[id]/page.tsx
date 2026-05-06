"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { demoSpeech } from "../../../../lib/demoData";

import Loader from "../../../../components/ui/Loader";
import ScoreGauge from "../../../../components/speech/ScoreGauge";
import MetricsPanel from "../../../../components/speech/MetricsPanel";
import TranscriptViewer from "../../../../components/speech/TranscriptViewer";
import FeedbackPanel from "../../../../components/speech/FeedbackPanel";

export default function SpeechPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // DEMO MODE
        if (id === "demo") {
          setData(demoSpeech);
          setLoading(false);
          return;
        }

        // FIRESTORE FETCH
        const ref = doc(db, "speeches", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setData(snap.data());
        } else {
          console.warn("Speech not found, loading demo");
          setData(demoSpeech);
        }
      } catch (error) {
        console.error("Error fetching speech:", error);
        setData(demoSpeech);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader />
        <p className="mt-4 text-gray-500">Loading speech analysis...</p>
      </div>
    );
  }

  // NO DATA
  if (!data) {
    return (
      <div className="p-10 text-center text-gray-500">
        No speech data available
      </div>
    );
  }

  // PROCESSING STATE
  if (data?.status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader />
        <p className="mt-4 text-gray-500">
          AI is analyzing your speech. Please wait...
        </p>
      </div>
    );
  }

  // FINAL UI
  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">Speech Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <div className="space-y-6">

          {/* SCORE CARD */}
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-gray-500">Speech Score</h2>

            <div className="mt-4">
              <ScoreGauge score={data?.overallScore || 0} />
            </div>

            <p className="text-sm text-gray-400 mt-2">
              AI Evaluation Score
            </p>
          </div>

          {/* METRICS */}
          <MetricsPanel metrics={data?.metrics || {}} />

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* TRANSCRIPT */}
          <TranscriptViewer text={data?.transcript || ""} />

          {/* FEEDBACK */}
          <FeedbackPanel feedback={data?.feedback || {}} />

        </div>

      </div>

    </div>
  );
}