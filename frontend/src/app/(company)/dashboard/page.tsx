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
import ApplicantsTable from "@/app/components/dashboardCmp/ApplicantsTable";
import RecentActivity from "@/app/components/dashboardCmp/RecentActivity";

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
            <DashboardSidebar />
            
          </div>

          {/* Content */}
          <main className="flex-1 space-y-6">
            {/* Overview Section */}
            <section id="overview" className="bg-white shadow rounded-lg p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-black mb-2">
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
                  <div className="text-gray-700 text-sm">{title}</div>
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

             <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2"><ApplicantsTable /></div>
          <RecentActivity />
        </section>
          </main>
        </div>

        <DashboardFooter />
      </div>
    </ProtectedRoute>
  );
}
