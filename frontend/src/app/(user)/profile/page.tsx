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
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);

  useEffect(() => {
    if (token) authenticateSocket(token);

    socket.emit("getProfile", {}, (res: any) => {
      if (res.status === "ok" && res.profile) {
        const p = res.profile;
        setProfile(p);
        setForm({
          headline: p.headline || "",
          about: p.about || "",
          location: p.location || "",
          website: p.website || "",
          skills: (p.skills || []).join(", "),
        });
        setEducation(p.education || []);
        setExperience(p.experience || []);
      }
    });
  }, [token]);

  // ✅ Convert File to Base64
  const toBase64 = (f: File) =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(f);
    });

  // ✅ Save Profile
  const handleSave = async () => {
    let avatarBase64: string | undefined;
    if (avatar) avatarBase64 = await toBase64(avatar);

    socket.emit(
      "saveProfile",
      {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()),
        avatarBase64,
        education,
        experience,
      },
      (res: any) => {
        if (res.status === "ok") {
          setProfile(res.profile);
          alert("✅ Profile updated successfully!");
        } else alert("❌ " + res.message);
      }
    );
  };

  // ✅ Add new education or experience
  const addEducation = () =>
    setEducation([...education, { degree: "", institute: "", startYear: "", endYear: "" }]);
  const addExperience = () =>
    setExperience([...experience, { title: "", company: "", startYear: "", endYear: "" }]);

  const handleEduChange = (i: number, key: string, value: string) => {
    const updated = [...education];
    updated[i][key] = value;
    setEducation(updated);
  };

  const handleExpChange = (i: number, key: string, value: string) => {
    const updated = [...experience];
    updated[i][key] = value;
    setExperience(updated);
  };

  const removeEdu = (i: number) => setEducation(education.filter((_, idx) => idx !== i));
  const removeExp = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-200 to-gray-300 text-gray-800">
        {/* Hero */}
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
            <p className="text-gray-200 text-sm md:text-base">
              Showcase your journey — education, experience & skills.
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 -mt-20 relative z-10"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <motion.div whileHover={{ scale: 1.05 }} className="relative group">
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

          <h2 className="text-2xl font-semibold text-center mb-6 text-blue-700">
            Edit Your Profile
          </h2>

          {/* Basic Info */}
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
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
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

          {/* Education */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">Education</h3>
            {education.map((edu, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                <input
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => handleEduChange(i, "degree", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <input
                  placeholder="Institute"
                  value={edu.institute}
                  onChange={(e) => handleEduChange(i, "institute", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <input
                  placeholder="Start Year"
                  value={edu.startYear}
                  onChange={(e) => handleEduChange(i, "startYear", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <input
                  placeholder="End Year"
                  value={edu.endYear}
                  onChange={(e) => handleEduChange(i, "endYear", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <button
                  onClick={() => removeEdu(i)}
                  className="col-span-2 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
            >
              + Add Education
            </button>
          </div>

          {/* Experience */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">Experience</h3>
            {experience.map((exp, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                <input
                  placeholder="Title"
                  value={exp.title}
                  onChange={(e) => handleExpChange(i, "title", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <input
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => handleExpChange(i, "company", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <input
                  placeholder="Start Year"
                  value={exp.startYear}
                  onChange={(e) => handleExpChange(i, "startYear", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <input
                  placeholder="End Year"
                  value={exp.endYear}
                  onChange={(e) => handleExpChange(i, "endYear", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <button
                  onClick={() => removeExp(i)}
                  className="col-span-2 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
            >
              + Add Experience
            </button>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="mt-8 w-full bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 shadow-md transition-all"
          >
            Save Changes
          </motion.button>

          {/* Live Preview */}
          {profile && (
            <div className="mt-10 border-t pt-5 text-gray-700 space-y-2">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">Live Preview</h3>
              <p><strong>Headline:</strong> {profile.headline}</p>
              <p><strong>About:</strong> {profile.about}</p>
              <p><strong>Location:</strong> {profile.location}</p>
              <p><strong>Website:</strong> {profile.website}</p>
              <p><strong>Skills:</strong> {(profile.skills || []).join(", ")}</p>

              {/* Education Preview */}
              {profile.education?.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-3">Education:</h4>
                  <ul className="list-disc ml-5">
                    {profile.education.map((e: any, i: number) => (
                      <li key={i}>
                        {e.degree} at {e.institute} ({e.startYear}-{e.endYear})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Experience Preview */}
              {profile.experience?.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-3">Experience:</h4>
                  <ul className="list-disc ml-5">
                    {profile.experience.map((e: any, i: number) => (
                      <li key={i}>
                        {e.title} at {e.company} ({e.startYear}-{e.endYear})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
