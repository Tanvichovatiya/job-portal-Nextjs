"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { getAuth } from "../../../../../lib/auth";
import { authenticateSocket, socket } from "../../../../../lib/socket";

export default function SingleJobPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { token, user } = getAuth();

  useEffect(() => {
    if (token) authenticateSocket(token);

    socket.emit("getJobById", id, (res: any) => {
      if (res.status === "ok") setJob(res.job);
    });

    return () => socket.off("getJobById");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fileToBase64 = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => {
        const str = reader.result as string;
        const base64 = str.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (e) => reject(e);
    });

  const handleApply = async () => {
    if (!file) return alert("Please upload resume");
    if (!user?.id) return alert("You must be logged in as candidate");

    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      socket.emit(
        "applyToJob",
        { jobId: id, userId: user.id, resumeBase64: base64 },
        (res: any) => {
          setLoading(false);
          if (res.status === "ok") alert("Application submitted!");
          else alert(res.message || "Failed to apply");
        }
      );
    } catch (err: any) {
      setLoading(false);
      alert("Upload error");
    }
  };

  if (!job) return <div className="p-6 text-center">Loading job...</div>;

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative w-full h-64 md:h-96 flex items-center bg-cover bg-center"
        style={{ backgroundImage: "url('/hero/h1_hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-left px-6">
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            {job.title}
          </h1>
          <p className="text-gray-200 mt-2 text-sm md:text-lg">
            {job.companyName} • {job.location || "Remote"} • {job.jobType || "Full-time"}
          </p>
        </div>
      </section>

      {/* Job Details */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-black mb-4">
            Job Description
          </h2>
          <p className="text-gray-700 mb-6">{job.description}</p>

          {/* Resume Upload */}
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">
              Upload Resume (PDF/DOC)
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-2 w-full text-gray-700"
            />
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={loading}
              className="flex-1 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
            >
              {loading ? "Applying..." : "Apply Now"}
            </button>
           
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
