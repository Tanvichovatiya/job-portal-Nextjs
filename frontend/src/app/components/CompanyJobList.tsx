"use client";
import React, { useEffect, useState } from "react";
import { socket, authenticateSocket } from "../../../lib/socket";
import { getAuth } from "../../../lib/auth";

type Job = {
  id: string;
  title: string;
  description: string;
  location?: string;
  salary?: number;
  employer?: { name: string };
  companyName?: string;
};

export default function CompanyJobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 👉 Function to keep only 7 words
  const smallDesc = (text: string) => {
    const words = text.split(" ");
    return words.length > 7
      ? words.slice(0, 7).join(" ") + "..."
      : text;
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      const auth = getAuth();
      if (!auth?.token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const res = await authenticateSocket(auth.token);
      if (res.status !== "ok") {
        setError(res.message || "Socket auth failed");
        setLoading(false);
        return;
      }

      if (res.role && res.role !== "company") {
        setError("Not authorized as company");
        setLoading(false);
        return;
      }

      const fetchMyJobs = () => {
        socket.emit("getMyJobs", {}, (resp: any) => {
          if (!mounted) return;
          if (resp.status === "ok") {
            setJobs(resp.jobs || []);
            setError(null);
          } else {
            setError(resp.message || "Could not fetch jobs");
          }
          setLoading(false);
        });
      };

      if (socket.connected) fetchMyJobs();
      else socket.once("connect", fetchMyJobs);

      const onCreated = fetchMyJobs;
      const onUpdated = (job: Job) =>
        setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
      const onDeleted = ({ jobId }: { jobId: string }) =>
        setJobs((prev) => prev.filter((j) => j.id !== jobId));

      socket.on("job:created", onCreated);
      socket.on("job:updated", onUpdated);
      socket.on("job:deleted", onDeleted);
    }

    init();

    return () => {
      mounted = false;
      socket.off("job:created");
      socket.off("job:updated");
      socket.off("job:deleted");
    };
  }, []);

  if (loading) return <div className="text-center mt-4">Loading your jobs...</div>;
  if (error) return <div className="text-center mt-4 text-red-600">{error}</div>;
  if (!jobs.length)
    return <div className="text-center text-gray-500 mt-4">No jobs posted yet.</div>;

  return (
    <div className="container mt-6">
      <h3 className="text-xl font-semibold mb-4">My Posted Jobs</h3>

      {/* Scrollbar added here */}
      <div className="max-h-[400px] overflow-y-auto pr-2">
        <ul className="list-group">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="list-group-item border rounded shadow-sm mb-2 p-3"
            >
              <h5 className="font-semibold text-blue-700">{job.title}</h5>

              {/* Only 7 words */}
              <p className="text-gray-700 mb-2">{smallDesc(job.description)}</p>

              <small className="text-gray-500">
                📍 {job.location || "N/A"} &nbsp; | &nbsp; 💰{" "}
                {job.salary ? `₹${job.salary}` : "N/A"}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
