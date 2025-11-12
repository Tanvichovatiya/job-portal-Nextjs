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

  const fetchJobs = (searchValue = "") => {
    setLoading(true);
    const filters = { search: searchValue, location, category, jobType };

    socket.emit("getJobs", filters, (res: any) => {
      if (res.status === "ok") setJobs(res.jobs);
      else alert(res.message || "Could not fetch jobs");
      setLoading(false);
    });
  };

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

  useEffect(() => {
    const t = setTimeout(() => fetchJobs(search), 300);
    return () => clearTimeout(t);
  }, [search, location, category, jobType]);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:justify-between px-6 py-16 md:py-24">
          {/* Text Section */}
          <div className="md:w-1/2 text-left z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight mb-4">
              Find Your <span className="text-gray-700">Dream Job</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl mb-6 max-w-lg">
              Explore top opportunities that match your skills and ambitions.
              Apply easily and take your career to the next level.
            </p>
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
              Get Started
            </button>
          </div>

          {/* Hero Image */}
          <div className="hidden md:block md:w-1/2">
            <img
              src="/hero/h1_hero.jpg"
              alt="Job search"
              className="w-full h-full object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by title/company/location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 text-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            />

            <input
              type="text"
              placeholder="Location (e.g., Remote)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border text-gray-600 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-black focus:outline-none text-gray-600"
            >
              <option value="">Category</option>
              <option value="Engineering">IT</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-black focus:outline-none text-gray-600"
            >
              <option value="">Job Type</option>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-44 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : jobs.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block no-underline">
                <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 h-full flex flex-col justify-between border border-gray-100">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-semibold text-black">{job.title}</h3>
                      {job.salary && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md">
                          ${job.salary}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{job.companyName}</p>
                    <p className="text-gray-700 text-sm line-clamp-2 mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {job.location && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md">
                          {job.location}
                        </span>
                      )}
                      {job.category && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md">
                          {job.category}
                        </span>
                      )}
                      {job.jobType && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md">
                          {job.jobType}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800 transition">
                      Apply
                    </button>
                    
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-white py-12">No jobs found.</div>
        )}
      </div>

      <Footer />
    </>
  );
}
