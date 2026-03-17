"use client";

import { useEffect, useState } from "react";

interface TimelineItem {
  id: string;
  title: string;
  createdAt?: any;
}

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporary placeholder logic
    // Later this will be replaced with Firestore timeline data
    const mockData: TimelineItem[] = [
      {
        id: "1",
        title: "Welcome to ATF Vaktha Timeline",
        createdAt: new Date(),
      },
    ];

    setTimeline(mockData);
    setLoading(false);
  }, []);

  return (
    <main className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Timeline</h1>

      {/* Loading */}
      {loading && (
        <p className="text-gray-500">Loading timeline...</p>
      )}

      {/* Empty */}
      {!loading && timeline.length === 0 && (
        <p className="text-gray-500">No activity yet.</p>
      )}

      {/* Timeline List */}
      <div className="space-y-4">
        {timeline.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <p className="font-medium">{item.title}</p>

            {item.createdAt && (
              <p className="text-xs text-gray-400 mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}