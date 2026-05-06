"use client";

export default function SectionAnalysis({ sections }: any) {
  if (!sections) {
    return <p className="text-gray-400">No section analysis.</p>;
  }

  const truncate = (text: string) =>
    text && text.length > 200 ? text.slice(0, 200) + "..." : text;

  return (
    <div className="bg-gray-50 p-5 rounded mt-4">

      <h2 className="font-bold mb-3">Speech Structure</h2>

      <div className="space-y-3 text-sm">

        <div>
          <p className="font-semibold">Opening</p>
          <p>{truncate(sections.opening) || "-"}</p>
        </div>

        <div>
          <p className="font-semibold">Body</p>
          <p>{truncate(sections.body) || "-"}</p>
        </div>

        <div>
          <p className="font-semibold">Closing</p>
          <p>{truncate(sections.closing) || "-"}</p>
        </div>

      </div>

    </div>
  );
}
