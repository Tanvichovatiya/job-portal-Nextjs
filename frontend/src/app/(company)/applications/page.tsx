
"use client";

import React from "react";
import { motion } from "framer-motion";
import DashboardNavbar from "@/app/components/dashboardCmp/DashboardNavbar";
import DashboardFooter from "@/app/components/dashboardCmp/DashboardFooter";
import RecentActivity from "@/app/components/dashboardCmp/RecentActivity";
import ApplicantsTable from "@/app/components/dashboardCmp/ApplicantsTable";

export default function CompanyApplicationsPage() {
  return (
    <>
      <DashboardNavbar />

      {/* 🟦 Hero Section */}
      <div
        className="relative h-[250px] md:h-[300px] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1590608897129-79b5b1aa9e77?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-2"
          >
            Job Applications Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm md:text-base text-gray-200"
          >
            Review, manage, and track applicants for your posted jobs in real-time.
          </motion.p>
        </div>
      </div>

      {/* 🟨 Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-16 mb-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Applicants Table */}
        <div className="lg:col-span-2">
          <ApplicantsTable />
        </div>

        {/* Right: Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

      <DashboardFooter />
    </>
  );
}
