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
};

export default function CompanyJobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.token) {
      console.error("❌ No token found — user not authenticated");
      setLoading(false);
      return;
    }

    // ✅ Authenticate socket using stored JWT
    authenticateSocket(auth.token);

    // ✅ Function to fetch only jobs created by this company
    const fetchMyJobs = () => {
      socket.emit("getMyJobs", {}, (res: any) => {
        if (res.status === "ok") {
          setJobs(res.jobs);
        } else {
          console.error("Error fetching jobs:", res.message);
        }
        setLoading(false);
      });
    };

    // ✅ Wait until socket is connected before fetching
    if (socket.connected) fetchMyJobs();
    else socket.on("connect", fetchMyJobs);

    // ✅ Real-time listeners
    const onCreated = fetchMyJobs;
    const onUpdated = (job: Job) =>
      setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
    const onDeleted = ({ jobId }: { jobId: string }) =>
      setJobs((prev) => prev.filter((j) => j.id !== jobId));

    socket.on("job:created", onCreated);
    socket.on("job:updated", onUpdated);
    socket.on("job:deleted", onDeleted);

    // ✅ Cleanup
    return () => {
      socket.off("connect", fetchMyJobs);
      socket.off("job:created", onCreated);
      socket.off("job:updated", onUpdated);
      socket.off("job:deleted", onDeleted);
    };
  }, []);

  if (loading) return <div className="text-center mt-4">Loading your jobs...</div>;

  if (!jobs.length)
    return (
      <div className="text-center text-gray-500 mt-4">
        No jobs posted yet.
      </div>
    );

  return (
    <div className="container mt-6">
      <h3 className="text-xl font-semibold mb-4">My Posted Jobs</h3>
      <ul className="list-group">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="list-group-item border rounded shadow-sm mb-2 p-3"
          >
            <h5 className="font-semibold text-blue-700">{job.title}</h5>
            <p className="text-gray-700 mb-2">{job.description}</p>
            <small className="text-gray-500">
              📍 {job.location || "N/A"} &nbsp; | &nbsp; 💰{" "}
              {job.salary ? `₹${job.salary}` : "N/A"}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
