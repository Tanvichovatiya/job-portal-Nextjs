"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/app/components/dashboardCmp/DashboardNavbar";
import DashboardSidebar from "@/app/components/dashboardCmp/DashboardSidebar";
import DashboardFooter from "@/app/components/dashboardCmp/DashboardFooter";
import RecentActivity from "@/app/components/dashboardCmp/RecentActivity";
import ApplicantsTable from "@/app/components/dashboardCmp/ApplicantsTable";
import JobForm from "@/app/components/JobForm";

import { getAuth, clearAuth } from "../../../../lib/auth";
import CompanyJobList from "@/app/components/CompanyJobList";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true); // to prevent premature auth check

  useEffect(() => {
    try {
      const auth = getAuth();
      if (auth?.user) {
        setUser(auth.user);
      } else {
        // no user found, redirect without showing alert
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (loading) return null; // wait until auth is verified
  if (!user) return null; // just redirect silently, no alert

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar userName={user.name} onLogout={handleLogout} />

      <div className="flex flex-1 py-6 px-4 lg:px-8">
        <div className="hidden md:block md:w-64 lg:w-56">
          <DashboardSidebar />
        </div>

        <main className="flex-1 space-y-6">
          {/* Overview */}
          <section id="overview" className="bg-white shadow rounded-lg p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-black mb-2">
                  Welcome back, {user.name}
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

          {/* Job Form & List */}
          <section id="create-job" className="bg-white shadow rounded-lg p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <JobForm />
              </div>
              <div id="your-jobs">
                <h5 className="text-lg font-medium mb-3 text-gray-700">Your Jobs</h5>
                <CompanyJobList onEdit={(job) => console.log("Edit Job:", job)} />

              </div>
            </div>
          </section>

          {/* Applicants and Recent Activity */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ApplicantsTable />
            </div>
            <RecentActivity />
          </section>
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
}
