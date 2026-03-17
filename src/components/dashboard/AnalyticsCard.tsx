"use client";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
}

export default function AnalyticsCard({ title, value }: AnalyticsCardProps) {
  return (
    <div className="bg-white shadow rounded p-6 w-full">
      
      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="text-2xl font-bold text-blue-700 mt-2">
        {value}
      </p>

    </div>
  );
}