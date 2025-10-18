"use client";
import React, { useEffect, useState } from "react";
import { socket, authenticateSocket } from "../../../../lib/socket";
import { getAuth } from "../../../../lib/auth";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { token } = getAuth();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    headline: "",
    about: "",
    location: "",
    website: "",
    skills: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);

  useEffect(() => {
    if (token) authenticateSocket(token);

    socket.emit("getProfile", {}, (res: any) => {
      if (res.status === "ok" && res.profile) {
        setProfile(res.profile);
        setForm({
          headline: res.profile.headline || "",
          about: res.profile.about || "",
          location: res.profile.location || "",
          website: res.profile.website || "",
          skills: (res.profile.skills || []).join(", "),
        });
      }
    });
  }, [token]);

  const handleSave = async () => {
    let avatarBase64: string | undefined;
    if (avatar) {
      const reader = new FileReader();
      avatarBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(avatar);
      });
    }

    socket.emit(
      "saveProfile",
      {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()),
        avatarBase64,
      },
      (res: any) => {
        if (res.status === "ok") {
          setProfile(res.profile);
          alert("✅ Profile updated!");
        } else alert("❌ " + res.message);
      }
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen    bg-gradient-to-b from-gray-200 to-gray-300 text-gray-800">
        {/* 🟦 Header / Hero Section */}
        <div
          className="relative h-[300px] md:h-[350px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522205408450-add114ad53fe?auto=format&fit=crop&w=1500&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-2"
            >
              My Professional Profile
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm md:text-base text-gray-200"
            >
              Showcase your journey — education, experience & skills.
            </motion.p>
          </div>
        </div>

        {/* 🟨 Profile Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 -mt-20 relative z-10"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-gray-500 text-2xl font-bold">
                  ?
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </label>
            </motion.div>
          </div>

          {/* Form Fields */}
          <h2 className="text-2xl font-semibold text-center mb-6 text-blue-700">
            Edit Your Profile
          </h2>

          <div className="grid gap-5">
            {[
              { key: "headline", label: "Professional Headline" },
              { key: "about", label: "About (Summary)" },
              { key: "location", label: "Location" },
              { key: "website", label: "Website / Portfolio" },
              { key: "skills", label: "Skills (comma separated)" },
            ].map((f) => (
              <div key={f.key} className="relative">
                <input
                  type="text"
                  id={f.key}
                  value={(form as any)[f.key]}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                  className="peer border border-gray-300 rounded-md px-3 pt-5 pb-2 w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <label
                  htmlFor={f.key}
                  className="absolute left-3 top-2 text-sm text-gray-500 peer-focus:text-xs peer-focus:-top-1 peer-focus:text-blue-600 transition-all"
                >
                  {f.label}
                </label>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="mt-8 w-full bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 shadow-md transition-all"
          >
            Save Changes
          </motion.button>

          {/* Profile Preview Section */}
          {profile && (
            <div className="mt-10 border-t pt-5 text-gray-700 space-y-2">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">
                Live Preview
              </h3>
              <p>
                <strong>Headline:</strong> {profile.headline}
              </p>
              <p>
                <strong>About:</strong> {profile.about}
              </p>
              <p>
                <strong>Location:</strong> {profile.location}
              </p>
              <p>
                <strong>Website:</strong> {profile.website}
              </p>
              <p>
                <strong>Skills:</strong>{" "}
                {(profile.skills || []).join(", ")}
              </p>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
