"use client";
import React, { useEffect, useState } from "react";
import { socket } from "../../../lib/socket";
import { getAuth } from "../../../lib/auth";

type Job = {
  id: string;
  title: string;
  description: string;
  companyName: string;
  salary?: number;
  location?: string;
  category?: string;
  jobType?: string;
  createdAt?: string;
};

export default function CompanyJobList({
  onEdit,
}: {
  onEdit: (job: Job) => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // ✅ Fetch only the logged-in company's jobs
  useEffect(() => {
    const fetchMyJobs = () => {
      socket.emit("getMyJobs", {}, (res: any) => {
        if (res.status === "ok") setJobs(res.jobs);
        else alert(res.message || "Could not fetch jobs");
        setLoading(false);
      });
    };

    fetchMyJobs();

    // ✅ Real-time updates
    const onCreated = fetchMyJobs;
    const onUpdated = (job: Job) =>
      setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
    const onDeleted = ({ jobId }: { jobId: string }) =>
      setJobs((prev) => prev.filter((j) => j.id !== jobId));

    socket.on("job:created", onCreated);
    socket.on("job:updated", onUpdated);
    socket.on("job:deleted", onDeleted);

    return () => {
      socket.off("job:created", onCreated);
      socket.off("job:updated", onUpdated);
      socket.off("job:deleted", onDeleted);
    };
  }, []);

  // ✅ View job details (via getJobById)
  const viewJobDetails = (id: string) => {
    socket.emit("getJobById", id, (res: any) => {
      if (res.status === "ok") setSelectedJob(res.job);
      else alert(res.message || "Could not fetch job details");
    });
  };

  // ✅ Delete job
  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    socket.emit("deleteJob", { jobId: id }, (res: any) => {
      if (res.status !== "ok") alert(res.message || "Delete failed");
    });
  };

  if (loading) return <div className="text-center mt-5">Loading jobs...</div>;
  if (!jobs.length)
    return <div className="text-center mt-4 text-muted">No jobs found.</div>;

  // ✅ Filtered jobs
  const filtered = jobs.filter((j) =>
    j.companyName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-3 d-flex gap-2">
        <input
          className="form-control"
          placeholder="Filter by company name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {filtered.map((job) => (
        <div
          key={job.id}
          className="card mb-2 p-3 shadow-sm border rounded"
          style={{ borderLeft: "5px solid #0d6efd" }}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1 text-primary">{job.title}</h5>
              <p className="mb-1 text-muted">{job.companyName}</p>
              <p className="small mb-1">{job.description}</p>
              <p className="small text-secondary">
                📍 {job.location || "N/A"} • 🏷 {job.category || "General"} • 💼{" "}
                {job.jobType || "FULL_TIME"} • 💰 Salary:{" "}
                {job.salary ? `₹${job.salary}` : "N/A"}
              </p>
            </div>

            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-sm btn-outline-info"
                onClick={() => viewJobDetails(job.id)}
              >
                View
              </button>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => onEdit(job)}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(job.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ✅ Modal or inline details */}
      {selectedJob && (
        <div className="card mt-4 p-3 border border-info">
          <h5>{selectedJob.title}</h5>
          <p className="mb-1">
            <strong>Company:</strong> {selectedJob.companyName}
          </p>
          <p>{selectedJob.description}</p>
          <p>
            <strong>Category:</strong> {selectedJob.category} <br />
            <strong>Location:</strong> {selectedJob.location} <br />
            <strong>Type:</strong> {selectedJob.jobType} <br />
            <strong>Salary:</strong>{" "}
            {selectedJob.salary ? `₹${selectedJob.salary}` : "N/A"}
          </p>
          <button
            className="btn btn-sm btn-secondary mt-2"
            onClick={() => setSelectedJob(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}  