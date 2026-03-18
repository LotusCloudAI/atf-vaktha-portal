"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

type Props = {
  data: any[];
};

export default function SpeechHistoryChart({ data }: Props) {

  const chartData = data.map((speech, index) => ({
    speech: index + 1,
    score: speech.speechScore
  }));

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        border: "1px solid #ddd"
      }}
    >
      <h3>Speech Progress</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="speech" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#1976d2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}