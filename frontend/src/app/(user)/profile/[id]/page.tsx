"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useParams } from "next/navigation";
import { getAuth } from "../../../../../lib/auth";
import { authenticateSocket, getProfileById, socket } from "../../../../../lib/socket";

type Profile = {
  id: string;
  headline?: string;
  about?: string;
  location?: string;
  website?: string;
  skills?: string[];
  avatar?: string;
  education?: any[];
  experience?: any[];
  user: { id: string; name: string; email: string };
};

export default function ViewProfile() {
  const params = useParams();
  const { token } = getAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = params.id;

  useEffect(() => {
    if (!token) return;
    authenticateSocket(token);

    getProfileById(userId, (res) => {
      if (res.status === "ok") setProfile(res.profile);
      else alert(res.message);
      setLoading(false);
    });
  }, [token, userId]);

  if (loading) return <p className="text-center mt-20 text-gray-500">Loading...</p>;
  if (!profile) return <p className="text-center mt-20 text-gray-500">Profile not found</p>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row md:items-center p-6 mb-6">
            <div className="flex-shrink-0 flex justify-center md:justify-start mb-4 md:mb-0">
              <img
                src={profile.avatar || "/default-avatar.png"}
                alt={profile.user.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
              />
            </div>
            <div className="md:ml-6 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{profile.user.name}</h1>
              {profile.headline && (
                <p className="text-gray-600 text-lg mt-1">{profile.headline}</p>
              )}
              {profile.location && (
                <p className="text-gray-500 mt-1">{profile.location}</p>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline mt-1 inline-block"
                >
                  {profile.website}
                </a>
              )}
            </div>
          </div>

          {/* About Section */}
          {profile.about && (
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3 border-b border-gray-200 pb-2">About</h2>
              <p className="text-gray-700">{profile.about}</p>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills?.length > 0 && (
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3 border-b border-gray-200 pb-2">Skills</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {profile.education?.length > 0 && (
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3 border-b border-gray-200 pb-2">Education</h2>
              <ul className="space-y-2 text-gray-700 mt-2">
                {profile.education.map((edu, idx) => (
                  <li key={idx} className="flex flex-col md:flex-row md:justify-between">
                    <span>
                      <strong>{edu.degree}</strong> at {edu.institute}
                    </span>
                    <span className="text-gray-500">
                      ({edu.startYear} - {edu.endYear})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Experience Section */}
          {profile.experience?.length > 0 && (
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3 border-b border-gray-200 pb-2">Experience</h2>
              <ul className="space-y-2 text-gray-700 mt-2">
                {profile.experience.map((exp, idx) => (
                  <li key={idx} className="flex flex-col md:flex-row md:justify-between">
                    <span>
                      <strong>{exp.title}</strong> at {exp.company}
                    </span>
                    <span className="text-gray-500">
                      ({exp.startYear} - {exp.endYear || "Present"})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
