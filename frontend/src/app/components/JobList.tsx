
"use client";

import React, { useEffect, useState } from "react";
import { socket } from "../../../lib/socket";

type Job = {
  id: string;
  title: string;
  description: string;
  location?: string;
  salary?: number;
  employer?: { name: string };
};

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    socket.emit("getJobs", {}, (res: any) => {
      if (res.status === "ok") setJobs(res.jobs);
    });

    socket.on("job:created", (job: Job) => {
      setJobs((prev) => [job, ...prev]);
    });

    socket.on("job:updated", (job: Job) => {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
    });

    socket.on("job:deleted", ({ jobId }) => {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    });

    return () => {
      socket.off("job:created");
      socket.off("job:updated");
      socket.off("job:deleted");
    };
  }, []);

  return (
    <div className="container mt-4">
      <h3>Job Listings</h3>
      <ul className="list-group">
        {jobs.map((job) => (
          <li key={job.id} className="list-group-item">
            <h5>{job.title}</h5>
            <p>{job.description}</p>
            <small>
              {job.location} | Salary: {job.salary} | By: {job.employer?.name}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
