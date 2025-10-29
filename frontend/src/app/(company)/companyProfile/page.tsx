"use client";
import React, { useEffect, useState } from "react";
import { socket, authenticateSocket } from "../../../../lib/socket";
import { getAuth } from "../../../../lib/auth";

import { motion } from "framer-motion";
import DashboardNavbar from "@/app/components/dashboardCmp/DashboardNavbar";
import DashboardFooter from "@/app/components/dashboardCmp/DashboardFooter";

export default function CompanyProfilePage() {
  const { token } = getAuth();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    companyName: "",
    description: "",
    location: "",
    website: "",
    industry: "",
    employees: "",
    foundedYear: "",
  });
  const [logo, setLogo] = useState<File | null>(null);

  useEffect(() => {
    if (token) authenticateSocket(token);
    socket.emit("getCompanyProfile", {}, (res: any) => {
      if (res.status === "ok") {
        setProfile(res.profile);
       
        setForm({
          companyName: res.profile.companyName || "",
          description: res.profile.description || "",
          location: res.profile.location || "",
          website: res.profile.website || "",
          industry: res.profile.industry || "",
          employees: res.profile.employees || "",
          foundedYear: res.profile.foundedYear || "",
        });
      }
    });
  }, [token]);

  const handleSave = async () => {
    let logoBase64: string | undefined;
    if (logo) {
      const reader = new FileReader();
      logoBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(logo);
      });
    }
    
    socket.emit(
      "saveCompanyProfile",
      {
        ...form,
        employees: Number(form.employees),
        foundedYear: Number(form.foundedYear),
        logoBase64,
      },
      (res: any) => {
        if (res.status === "ok") {
          setProfile(res.profile);
          alert("✅ Company Profile Updated!");
        } else {
          alert("❌ " + res.message);
        }
      }
    );
  };

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-200 to-gray-300 text-gray-800">
        {/* Header */}
        <div className="relative h-[300px] md:h-[350px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=1500&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-white">
            <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold mb-2">
              Company Profile
            </motion.h1>
          </div>
        </div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 -mt-20 relative z-10">
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <motion.div whileHover={{ scale: 1.05 }} className="relative group">
              {profile?.logo ? (
                <img src={profile.logo} alt="Logo"
                  className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-gray-500 text-2xl font-bold">🏢</div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                <input type="file" accept="image/*"
                  onChange={(e) => setLogo(e.target.files?.[0] || null)} className="hidden" />
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </label>
            </motion.div>
          </div>

          <h2 className="text-2xl font-semibold text-center mb-6 text-blue-700">
            Edit Company Details
          </h2>

          <div className="grid gap-5">
            {[
              { key: "companyName", label: "Company Name" },
              { key: "description", label: "Company Description" },
              { key: "location", label: "Location" },
              { key: "website", label: "Website" },
              { key: "industry", label: "Industry" },
              { key: "employees", label: "Employees" },
              { key: "foundedYear", label: "Founded Year" },
            ].map((f) => (
              <div key={f.key} className="relative">
                <input type="text" id={f.key} value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="peer border border-gray-300 rounded-md px-3 pt-5 pb-2 w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                <label htmlFor={f.key}
                  className="absolute left-3 top-2 text-sm text-gray-500 peer-focus:text-xs peer-focus:-top-1 peer-focus:text-blue-600 transition-all">
                  {f.label}
                </label>
              </div>
            ))}
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="mt-8 w-full bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 shadow-md">
            Save Changes
          </motion.button>

          {profile && (
            <div className="mt-10 border-t pt-5 text-gray-700 space-y-2">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">Live Preview</h3>
              <p><strong>Name:</strong> {profile.companyName}</p>
              <p><strong>Description:</strong> {profile.description}</p>
              <p><strong>Location:</strong> {profile.location}</p>
              <p><strong>Website:</strong> {profile.website}</p>
              <p><strong>Industry:</strong> {profile.industry}</p>
              <p><strong>Employees:</strong> {profile.employees}</p>
              <p><strong>Founded:</strong> {profile.foundedYear}</p>
            </div>
          )}
        </motion.div>
      </div>
      <DashboardFooter />
    </>
  );
}
