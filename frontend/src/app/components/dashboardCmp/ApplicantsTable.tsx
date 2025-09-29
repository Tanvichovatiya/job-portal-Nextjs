
"use client";
import React, { useEffect, useState } from "react";
import { socket, connectSocket } from "../../lib/socket";
import { getAuth } from "../../lib/auth";

type Applicant = { id: string; name: string; role: string; status: string; date: string; resume?: string };

export default function ApplicantsTable() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const auth = getAuth();

  useEffect(() => {
    if (auth.token) connectSocket(auth.token);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = (id: string, status: "accepted" | "rejected") => {
    socket.emit("updateApplicationStatus", { applicationId: id, status }, (res: any) => {
      if (res.status !== "ok") alert(res.message || "Failed");
    });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h5 className="font-medium">Applicants</h5>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Role", "Status", "Date", "Resume", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2 text-xs text-left text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applicants.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2">{a.name}</td>
                <td className="px-4 py-2">{a.role}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    a.status === "pending" ? "bg-yellow-100 text-yellow-800" : a.status === "accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>{a.status}</span>
                </td>
                <td className="px-4 py-2">{new Date(a.date).toLocaleString()}</td>
                <td className="px-4 py-2">{a.resume ? <a href={a.resume} target="_blank" className="text-blue-600">View</a> : "—"}</td>
                <td className="px-4 py-2 flex gap-2">
                  {a.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(a.id, "accepted")} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Accept</button>
                      <button onClick={() => updateStatus(a.id, "rejected")} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr><td colSpan={6} className="text-center p-4 text-gray-500">No applicants yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
