export default function TranscriptViewer({ speeches }: any) {

if (!speeches.length) return null;

return (

<div style={{
marginTop:"30px",
padding:"20px",
border:"1px solid #ddd",
borderRadius:"10px"
}}>

<h3>Speech Transcript</h3>

<p>{speeches[0].transcriptText}</p>

</div>

);
}