"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { getAuth } from "../../../../../lib/auth";
import { socket } from "../../../../../lib/socket";


type Job = {
  id: string;
  title: string;
  description: string
  companyName: string;
  salary?: number;
  location?: string;
  category?: string;
  jobType?: string;
  createdAt: string;
};

export default function SingleJobPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const auth = getAuth();

  useEffect(() => {
    if (auth.token) connectSocket(auth.token);

    if (id) {
      socket.emit("getJobById", id, (res: any) => {
        if (res.status === "ok") setJob(res.job);
        else setError(res.message || "Job not found");
      });
    }

    // real-time job updates
    socket.on("job:updated", (updatedJob: Job) => {
      if (updatedJob.id === id) setJob(updatedJob);
    });
    socket.on("job:deleted", ({ jobId }: { jobId: string }) => {
      if (jobId === id) setError("This job has been deleted");
    });

    return () => {
      socket.off("job:updated");
      socket.off("job:deleted");
    };
  }, [id]);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });

  const handleApply = async () => {
    if (!file) return alert("Please upload a resume");
    if (!auth.user?.id) return alert("You must be logged in as a candidate");

    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      socket.emit(
        "applyToJob",
        { jobId: id, userId: auth.user.id, resumeBase64: base64 },
        (res: any) => {
          setLoading(false);
          if (res.status === "ok") alert("Application submitted!");
          else alert(res.message || "Failed to apply");
        }
      );
    } catch {
      setLoading(false);
      alert("Error while uploading resume");
    }
  };

  if (error)
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center text-red-600">{error}</div>
        <Footer />
      </>
    );

  if (!job)
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">Loading job details...</div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="container py-6">
        <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
          <h2 className="text-2xl font-semibold mb-2">{job.title}</h2>
          <div className="text-sm text-gray-500 mb-2">{job.companyName}</div>
          {job.salary && (
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded mb-3 inline-block">
              Salary: ${job.salary}
            </span>
          )}
          <p className="mb-4">{job.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.location && <span className="badge">{job.location}</span>}
            {job.category && <span className="badge">{job.category}</span>}
            {job.jobType && <span className="badge">{job.jobType}</span>}
          </div>

          <label className="block mb-3">
            <span className="text-sm">Upload Resume (PDF/DOC)</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-2 block w-full"
            />
          </label>

          <button
            onClick={handleApply}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
