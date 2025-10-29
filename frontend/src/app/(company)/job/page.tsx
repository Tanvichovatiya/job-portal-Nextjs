
"use client";
import React, { useState } from "react";

import JobForm from "@/app/components/JobForm";
import JobList from "@/app/components/JobList";
import { motion } from "framer-motion";
import DashboardNavbar from "@/app/components/dashboardCmp/DashboardNavbar";
import DashboardFooter from "@/app/components/dashboardCmp/DashboardFooter";

export default function JobDashboardPage() {
  const [editingJob, setEditingJob] = useState<any>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNavbar />
      <div
      className="relative h-64 md:h-80 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1601758123927-2f123dff30c2?auto=format&fit=crop&w=1500&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-2"
        >
          Manage Your Job Postings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm md:text-base"
        >
          Create, update and track all your job openings in one place.
        </motion.p>
      </div>
    </div>

      <main className="flex-1 w-1/2 max-w-6xl mx-auto px-4 md:px-0 -mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Job Form */}
          <JobForm
            editingJob={editingJob}
            onSuccess={(job) => setEditingJob(null)}
            onCancel={() => setEditingJob(null)}
          />

          {/* Job List */}
          <JobList />
        </motion.div>
      </main>

      <DashboardFooter />
    </div>
  );
}
