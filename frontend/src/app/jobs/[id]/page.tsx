"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { socket } from "../../../../lib/socket";

type Job = {
  id: string;
  title: string;
  description: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch single job
  const fetchJob = () => {
    if (!id) return;
    setLoading(true);
    socket.emit("getJobById", id, (res: any) => {
      if (res.status === "ok") {
        setJob(res.job);
        setError("");
      } else {
        setError(res.message || "Could not fetch job");
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchJob();

    // Real-time update when job changes
    socket.on("job:updated", () => fetchJob());
    socket.on("job:deleted", ({ jobId }) => {
      if (jobId === id) setError("This job has been deleted");
    });

    return () => {
      socket.off("job:updated");
      socket.off("job:deleted");
    };
  }, [id]);

  if (loading)
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">Loading job details...</div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center text-danger">{error}</div>
        <Footer />
      </>
    );

  if (!job) return null;

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h3 className="mb-2">{job.title}</h3>
            <div className="text-muted mb-2">{job.companyName}</div>
            {job.salary && (
              <span className="badge bg-success mb-3">Salary: ${job.salary}</span>
            )}

            <div className="mb-3">{job.description}</div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {job.location && (
                <span className="badge bg-light text-dark">{job.location}</span>
              )}
              {job.category && (
                <span className="badge bg-light text-dark">{job.category}</span>
              )}
              {job.jobType && (
                <span className="badge bg-light text-dark">{job.jobType}</span>
              )}
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary btn-sm">Apply</button>
              <button className="btn btn-outline-secondary btn-sm">Save</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
