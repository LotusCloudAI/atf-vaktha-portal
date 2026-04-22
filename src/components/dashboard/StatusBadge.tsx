export default function StatusBadge({ status }: any) {
  const map: any = {
    processing: "bg-yellow-500",
    completed: "bg-green-600",
    failed: "bg-red-600",
  };

  return (
    <span className={`text-white px-3 py-1 text-xs rounded ${map[status] || "bg-gray-400"}`}>
      {status || "unknown"}
    </span>
  );
}
