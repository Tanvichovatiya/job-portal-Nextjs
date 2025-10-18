
"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { socket,authenticateSocket } from "../../../../lib/socket";
import { getAuth } from "../../../../lib/auth";

export default function MyNetwork() {
  const { token } = getAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (token) authenticateSocket(token);

    socket.emit("getAllUsers", {}, (res: any) => {
      if (res.status === "ok") setUsers(res.users);
    });

    socket.on("notification:new", (notif) => {
      setNotifications((prev) => [notif.message, ...prev]);
    });

    return () => {
      socket.off("notification:new");
    };
  }, [token]);

  const handleConnect = (receiverId: string) => {
    socket.emit("sendConnectionRequest", { receiverId }, (res: any) => {
      if (res.status === "ok") alert("Connection request sent!");
    });
  };

  const handleViewProfile = (id: string) => {
    window.location.href = `/profile/${id}`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">My Network</h1>
          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <img
                  src={user.profile?.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-20 h-20 mx-auto rounded-full mb-3 object-cover"
                />
                <h2 className="text-lg font-semibold text-center">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500 text-center mb-3">
                  {user.profile?.headline || "No headline yet"}
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleConnect(user.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => handleViewProfile(user.id)}
                    className="border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Drawer */}
        <div className="fixed top-20 right-6 bg-white shadow-xl rounded-lg w-80 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-700 border-b p-3">
            Notifications
          </h3>
          <div className="p-3 space-y-2">
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm">No notifications yet</p>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  {n}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
