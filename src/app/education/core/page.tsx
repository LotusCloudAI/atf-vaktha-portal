const tracks = [
  "Foundation",
  "Communication Mastery",
  "Leadership",
  "Professional",
  "Advanced Impact"
];

export default function CorePage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Vaktha Core</h2>

      <div className="grid grid-cols-2 gap-4 mt-6">
        {tracks.map((track) => (
          <div key={track} className="p-4 border rounded">
            <h3>{track}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
