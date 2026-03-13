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

export default function SpeechProgressChart({ data }: any) {

const chartData = data.map((speech: any, index: number) => ({
speech: index + 1,
score: speech.speechScore || 0
}));

return (
<div style={{
background:"#fff",
padding:"20px",
borderRadius:"10px",
border:"1px solid #ddd",
marginBottom:"20px"
}}>

<h3>Speech Score Progress</h3>

<ResponsiveContainer width="100%" height={250}>
<LineChart data={chartData}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="speech"/>
<YAxis/>
<Tooltip/>
<Line type="monotone" dataKey="score" stroke="#3b82f6"/>
</LineChart>
</ResponsiveContainer>

</div>
);
}