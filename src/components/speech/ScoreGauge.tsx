"use client";

type Props = {
  score: number;
};

export default function SpeechScoreGauge({ score }: Props) {

  let color = "#4CAF50";

  if (score < 80) color = "#FFC107";
  if (score < 60) color = "#F44336";

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        background: "#fff"
      }}
    >
      <h3>Speech Score</h3>

      <div
        style={{
          fontSize: "40px",
          fontWeight: "bold",
          color: color
        }}
      >
        {score}
      </div>

      <div style={{ fontSize: "14px", color: "#666" }}>
        AI Evaluation
      </div>
    </div>
  );
}