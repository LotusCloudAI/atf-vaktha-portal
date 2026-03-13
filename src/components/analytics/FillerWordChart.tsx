"use client";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid
} from "recharts";

export default function FillerWordChart({ data }: any) {

const chartData = data.map((speech: any, index: number) => ({
speech: index + 1,
filler: speech.fillerWordCount || 0
}));

return (
<div style={{
background:"#fff",
padding:"20px",
borderRadius:"10px",
border:"1px solid #ddd"
}}>

<h3>Filler Words Trend</h3>

<ResponsiveContainer width="100%" height={250}>
<BarChart data={chartData}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="speech"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="filler" fill="#ff7043"/>
</BarChart>
</ResponsiveContainer>

</div>
);
}