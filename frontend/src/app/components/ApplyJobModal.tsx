
"use client";
import React, { useState } from "react";
import { socket } from "../../../lib/socket";
import { getAuth } from "../../../lib/auth";

export default function ApplyJobModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const fileToBase64 = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
    });

  const handleSubmit = async () => {
    if (!file) return alert("Upload resume");
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      socket.emit("applyToJob", { jobId, userId: auth.user?.id, resumeBase64: base64 }, (res: any) => {
        setLoading(false);
        if (res.status === "ok") {
          alert("Applied");
          onClose();
        } else {
          alert(res.message || "Failed");
        }
      });
    } catch {
      setLoading(false);
      alert("Error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Apply for this job</h3>
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded">
            {loading ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
