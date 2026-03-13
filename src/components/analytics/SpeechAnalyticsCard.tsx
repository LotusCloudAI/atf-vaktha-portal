export default function SpeechAnalyticsCard({ speech }: any) {

return (

<div style={{
border:"1px solid #ddd",
padding:"20px",
borderRadius:"10px",
width:"250px"
}}>

<h3>Speech Score: {speech.speechScore}</h3>

<p>Words: {speech.wordCount}</p>
<p>Speed: {speech.wordsPerMinute} WPM</p>
<p>Filler Words: {speech.fillerWordCount}</p>
<p>Vocabulary Score: {speech.vocabularyScore}</p>

</div>

);
}