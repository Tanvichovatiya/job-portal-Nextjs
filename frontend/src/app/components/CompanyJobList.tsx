"use client";
import React, { useEffect, useState } from "react";
import { socket } from "../../../lib/socket";
import { getAuth } from "../../../lib/auth";

type Job = {
  id: string;
  title: string;
  description: string;
  companyname: string;
  salary?: number;
  location?: string;
  category?: string;
  jobType?: string;
  createdAt?: string;
};

export default function CompanyJobList({ onEdit }: { onEdit: (job: Job) => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // CompanyJobList.tsx
useEffect(() => {
  const fetch = () => {
    socket.emit("getMyJobs", {}, (res: any) => {
      if (res.status === "ok") setJobs(res.jobs);
      else alert(res.message || "Could not fetch jobs");
      setLoading(false);
    });
  };

  fetch(); // Fetch jobs on mount

  // Listen for real-time updates
  const onCreated = fetch;
  const onUpdated = (job: Job) => setJobs(prev => prev.map(j => j.id === job.id ? job : j));
  const onDeleted = ({ jobId }: { jobId: string }) => setJobs(prev => prev.filter(j => j.id !== jobId));

  socket.on("job:created", onCreated);
  socket.on("job:updated", onUpdated);
  socket.on("job:deleted", onDeleted);

  return () => {
    socket.off("job:created", onCreated);
    socket.off("job:updated", onUpdated);
    socket.off("job:deleted", onDeleted);
  };
}, []);



  // handle filter change (debounce optional)
  // useEffect(() => {
  //   const t = setTimeout(() => fetch(filter), 300);
  //   return () => clearTimeout(t);
  // }, [filter]);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this job?")) return;
    socket.emit("deleteJob", { jobId: id }, (res: any) => {
      if (res.status !== "ok") alert(res.message || "Delete failed");
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!jobs.length) return <div>No jobs found.</div>;

  return (
    <div>
      <div className="mb-3 d-flex gap-2">
        <input className="form-control" placeholder="Filter by company name" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      {jobs.map(job => (
        <div key={job.id} className="card mb-2 p-2">
          <div className="d-flex justify-content-between">
            <div>
              <h6 className="mb-1">{job.title} <small className="text-muted">- {job.companyname}</small></h6>
              <p className="mb-1">{job.description}</p>
              <small className="text-muted">{job.location} • {job.category} • {job.jobType} • Salary: {job.salary ?? "N/A"}</small>
            </div>
            <div className="d-flex flex-column gap-2">
              <button className="btn btn-sm btn-warning" onClick={() => onEdit(job)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(job.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
