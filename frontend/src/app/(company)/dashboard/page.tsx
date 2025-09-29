"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import JobForm from "@/app/components/JobForm";
import DashboardFooter from "@/app/components/dashboardCmp/DashboardFooter";
import DashboardNavbar from "@/app/components/dashboardCmp/DashboardNavbar";
import DashboardSidebar from "@/app/components/dashboardCmp/DashboardSidebar";
import CompanyJobList from "@/app/components/CompanyJobList";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { clearAuth, getAuth } from "../../../../lib/auth";

export default function DashboardPage() {
  const [editing, setEditing] = useState<any | null>(null);
  const router = useRouter();
  const { user } = getAuth();

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <ProtectedRoute requiredRole="company">
      <div className="min-h-screen flex flex-col bg-white">
        {/* Navbar */}
        <DashboardNavbar userName={user?.name} onLogout={handleLogout} />

        {/* Main content */}
        <div className="flex flex-1 py-6 px-4 lg:px-8">
          {/* Sidebar */}
          <div className="hidden md:block md:w-64 lg:w-56">
            <DashboardSidebar
              activeHref="#overview"
              items={[
                { href: "#overview", label: "Overview" },
                { href: "#create-job", label: "Create Job" },
                { href: "#your-jobs", label: "Your Jobs" },
              ]}
            />
          </div>

          {/* Content */}
          <main className="flex-1 space-y-6">
            {/* Overview Section */}
            <section id="overview" className="bg-white shadow rounded-lg p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    Welcome back, {user?.name || "Company"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Manage postings, track applicants, and grow your team.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="#create-job"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      Post a Job
                    </a>
                    <a
                      href="#your-jobs"
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition"
                    >
                      View Your Jobs
                    </a>
                  </div>
                </div>
                <div className="flex justify-center md:justify-end">
                  <img
                    src="/globe.svg"
                    alt="Dashboard illustration"
                    className="w-40 md:w-56"
                  />
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {["Active Jobs", "Applicants", "Interviews", "Offers"].map((title) => (
                <div key={title} className="bg-white shadow rounded-lg p-4 text-center">
                  <div className="text-gray-400 text-sm">{title}</div>
                  <div className="text-2xl font-semibold text-gray-800 mt-2">—</div>
                </div>
              ))}
            </section>

            {/* Create Job + Job List */}
            <section id="create-job" className="bg-white shadow rounded-lg p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <JobForm
                    editingJob={editing}
                    onSuccess={() => setEditing(null)}
                    onCancel={() => setEditing(null)}
                  />
                </div>
                <div id="your-jobs">
                  <h5 className="text-lg font-medium mb-3 text-gray-700">Your Jobs</h5>
                  <CompanyJobList onEdit={(job) => setEditing(job)} />
                </div>
              </div>
            </section>

            {/* Applicants + Activity */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Applicants Table */}
              <div className="xl:col-span-2 bg-white shadow rounded-lg overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b">
                  <h5 className="font-medium text-gray-700 mb-2 md:mb-0">Applicants</h5>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Search applicants"
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <select
                      defaultValue="all"
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="all">All statuses</option>
                      <option value="review">In review</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Name", "Role", "Status", "Date", "Actions"].map((th) => (
                          <th
                            key={th}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        { name: "Alex Johnson", role: "Frontend Engineer", status: "In review", date: "Sep 18, 2025" },
                        { name: "Priya Singh", role: "Backend Engineer", status: "Interview", date: "Sep 17, 2025" },
                        { name: "Maria Garcia", role: "Product Designer", status: "Offer", date: "Sep 15, 2025" },
                      ].map((applicant, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-gray-700">{applicant.name}</td>
                          <td className="px-4 py-2 text-gray-700">{applicant.role}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                applicant.status === "In review"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : applicant.status === "Interview"
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-green-200 text-green-800"
                              }`}
                            >
                              {applicant.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-500">{applicant.date}</td>
                          <td className="px-4 py-2 text-right flex gap-2 justify-end">
                            <button className="text-blue-600 text-sm border border-blue-600 rounded px-2 py-1 hover:bg-blue-50 transition">
                              View
                            </button>
                            <button className="text-gray-600 text-sm border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition">
                              Move
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-3">Recent Activity</h5>
                <div className="space-y-2">
                  {[
                    { text: "New application: Alex Johnson → Frontend", time: "2h" },
                    { text: "Interview scheduled: Priya Singh", time: "1d" },
                    { text: "Offer sent: Maria Garcia", time: "3d" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-600">
                      <span>{item.text}</span>
                      <span className="text-gray-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>

        <DashboardFooter />
      </div>
    </ProtectedRoute>
  );
}
