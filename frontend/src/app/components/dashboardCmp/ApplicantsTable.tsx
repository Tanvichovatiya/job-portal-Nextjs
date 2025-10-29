"use client";
import React, { useEffect, useState } from "react";
import { authenticateSocket, socket } from "../../../../lib/socket";
import { getAuth } from "../../../../lib/auth";

type Applicant = {
  id: string;
  name: string;
  role: string;
  status: string;
  date: string;
  resume?: string;
};

export default function ApplicantsTable() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const auth = getAuth();

  useEffect(() => {
    if (auth.token) authenticateSocket(auth.token);

    socket.on("employer:updateApplicants", ({ application }: any) => {
      setApplicants((prev) => {
        const exists = prev.find((p) => p.id === application.id);
        if (exists) {
          return prev.map((p) => (p.id === application.id ? application : p));
        }
        return [application, ...prev];
      });
    });

    socket.emit("getApplicants", (res: any) => {
      if (res.status === "ok") setApplicants(res.applicants);
    });

    return () => {
      socket.off("employer:updateApplicants");
    };
  }, [auth.token]);

  const updateStatus = (id: string, status: "accepted" | "rejected") => {
    socket.emit(
      "updateApplicationStatus",
      { applicationId: id, status },
      (res: any) => {
        if (res.status !== "ok") alert(res.message || "Failed to update status.");
      }
    );
  };

  // Download / View resume properly with correct file format
  const handleResumeClick = async (url: string | undefined) => {
    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch resume");

      const blob = await response.blob();

      // Get extension from URL
      const extensionMatch = url.match(/\.(pdf|docx?|txt)$/i);
      const extension = extensionMatch ? extensionMatch[0] : ".pdf"; // default .pdf
      const filename = `resume_${Date.now()}${extension}`;

      // Create link and trigger download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error("Download error:", err);
      alert("Failed to download resume");
    }
  };

  return (
    <div className="bg-white text-black shadow-md rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h5 className="text-lg font-semibold">Applicants</h5>
        <p className="text-sm text-gray-500 mt-1">Manage job applications in real time</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              {["Name", "Role", "Status", "Date", "Resume", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {applicants.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-5 py-3 font-medium">{a.name}</td>
                <td className="px-5 py-3">{a.role}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      a.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : a.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {new Date(a.date).toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  {a.resume ? (
                    <button
                      onClick={() => handleResumeClick(a.resume)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3 flex gap-2">
                  {a.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(a.id, "accepted")}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(a.id, "rejected")}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {applicants.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500 font-medium">
                  No applicants yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
