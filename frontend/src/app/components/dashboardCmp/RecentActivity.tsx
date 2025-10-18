"use client";
import React, { useEffect, useState } from "react";
import { authenticateSocket, socket } from "../../../../lib/socket";
import { getAuth } from "../../../../lib/auth";

export default function RecentActivity() {
  const [activities, setActivities] = useState<{ text: string; time: string }[]>([]);
  const auth = getAuth();

  useEffect(() => {
    if (auth.token) authenticateSocket(auth.token);

    socket.on("employer:updateApplicants", ({ activity }: any) => {
      setActivities((prev) => [activity, ...prev].slice(0, 20));
    });

    return () => {
      socket.off("employer:updateApplicants");
    };
  }, [auth.token]);

  return (
    <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100">
      <h5 className="text-lg text-center font-semibold text-black mb-4 border-b pb-2">
        Recent Activity
      </h5>

      <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        {activities.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            No recent activity
          </div>
        ) : (
          activities.map((a, i) => (
            <div
              key={i}
              className="flex justify-between items-start bg-gray-50 hover:bg-gray-100 transition rounded-lg p-3 text-sm"
            >
              <div className="text-black">{a.text}</div>
              <div className="text-gray-500 text-xs whitespace-nowrap ml-3">
                {new Date(a.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
