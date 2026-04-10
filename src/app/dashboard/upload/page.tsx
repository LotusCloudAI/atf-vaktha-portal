"use client";

import UploadForm from "@/components/speech/UploadForm";

export default function UploadPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Upload Speech</h1>
      <UploadForm />
    </div>
  );
}
