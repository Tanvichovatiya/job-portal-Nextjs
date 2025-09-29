
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { socket } from "../../../../lib/socket";


type Job = {
  id: string;
  title: string;
  description: string;
  companyName: string;
  location?: string;
  category?: string;
  jobType?: string;
  salary?: number;
};

export default function UserPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");

  // Fetch jobs from backend with filters
  const fetchJobs = (searchValue = "") => {
    setLoading(true);
    const filters = { search: searchValue, location, category, jobType };

    socket.emit("getJobs", filters, (res: any) => {
      if (res.status === "ok") setJobs(res.jobs);
      else alert(res.message || "Could not fetch jobs");
      setLoading(false);
     
      
    });
  };

  // Initial fetch & real-time updates
  useEffect(() => {
    fetchJobs();

    socket.on("job:created", () => fetchJobs(search));
    socket.on("job:updated", () => fetchJobs(search));
    socket.on("job:deleted", () => fetchJobs(search));

    return () => {
      socket.off("job:created");
      socket.off("job:updated");
      socket.off("job:deleted");
    };
  }, []);

  // Debounced search for all filters
  useEffect(() => {
    const t = setTimeout(() => fetchJobs(search), 300);
    return () => clearTimeout(t);
  }, [search, location, category, jobType]);

  return (
    <>
      <Navbar />
      <div className="container py-4">
        {/* Hero Section */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="row align-items-center g-4">
              <div className="col-12 col-lg-7">
                <h3 className="mb-2">Find your next role</h3>
                <p className="text-muted mb-0">
                  Search thousands of jobs across companies and locations.
                </p>
              </div>
              <div className="col-12 col-lg-5">
                <img
                  className="img-fluid"
                  src="/window.svg"
                  alt="Search jobs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-2">
              {/* Search Input */}
              <div className="col-12 col-md-4">
                <input
                  className="form-control"
                  placeholder="Search by title/company/location"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Location Input */}
              <div className="col-12 col-md-3">
                <input
                  className="form-control"
                  placeholder="Location (e.g., Remote,other)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Category Dropdown */}
              <div className="col-6 col-md-2">
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Category</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              {/* Job Type Dropdown */}
              <div className="col-6 col-md-3">
                <select
                  className="form-select"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="">Job Type</option>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="REMOTE">Remote</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Job List */}
        {loading ? (
          <div className="row g-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="col-12 col-md-6">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="placeholder-glow">
                      <span className="placeholder col-7"></span>
                      <span className="placeholder col-4"></span>
                      <span className="placeholder col-4"></span>
                      <span className="placeholder col-6"></span>
                      <span className="placeholder col-8"></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length ? (
          <div className="row g-3">
            {jobs.map((job) => (
              <div key={job.id} className="col-12 col-md-6">
                <Link href={`/jobs/${job.id}`} className="text-decoration-none text-dark">
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h5 className="mb-0">{job.title}</h5>
                      {job.salary != null && (
                        <span className="badge bg-success">${job.salary}</span>
                      )}
                    </div>
                    <div className="text-muted mb-2">{job.companyName}</div>
                    <p className="mb-3" style={{ minHeight: 48 }}>
                      {job.description}
                    </p>
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
                    <div className="mt-auto d-flex gap-2">
                      <button className="btn btn-primary btn-sm">Apply</button>
                      <button className="btn btn-outline-secondary btn-sm">Save</button>
                    </div>
                  </div>
                </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-5">No jobs found.</div>
        )}
      </div>
      <Footer />
    </>
  );
}
