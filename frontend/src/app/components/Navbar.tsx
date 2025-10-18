"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { socket, authenticateSocket } from "../../../lib/socket";
import { getAuth } from "../../../lib/auth";
import { Bell } from "lucide-react";
 // Notification icon from lucide-react

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const { token } = getAuth();

  // ✅ Authenticate socket & listen for notifications
  useEffect(() => {
    if (token) authenticateSocket(token);

    socket.on("notification:new", (notif) => {
      setNotifications((prev) => [notif.message, ...prev]);
    });

    return () => {
      socket.off("notification:new");
    };
  }, [token]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/home" className="flex items-center">
              <Image
                src="/logo/logo.png"
                alt="Job Portal Logo"
                width={120}
                height={45}
                className="rounded"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 relative">
            <Link
              href="/home"
              className="text-black font-medium hover:text-gray-700 transition"
            >
              Home
            </Link>
            <Link
              href="/jobs"
              className="text-black font-medium hover:text-gray-700 transition"
            >
              Jobs
            </Link>
            <Link
              href="/my-network"
              className="text-black font-medium hover:text-gray-700 transition"
            >
              My Network
            </Link>
            <Link
              href="/profile"
              className="text-black font-medium hover:text-gray-700 transition"
            >
              Profile
            </Link>
            <Link
              href="/logout"
              className="text-black font-medium hover:text-gray-700 transition"
            >
              Logout
            </Link>

            {/* 🔔 Notification Icon */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative focus:outline-none"
              >
                <Bell className="h-6 w-6 text-gray-700 hover:text-gray-900 transition" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn">
                  <div className="p-3 border-b font-semibold text-gray-800">
                    Notifications
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-sm p-3">
                        No new notifications
                      </p>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={i}
                          className="p-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          {n}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Notification bell for mobile */}
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative focus:outline-none"
            >
              <Bell className="h-6 w-6 text-gray-700 hover:text-gray-900" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1">
                  {notifications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="px-6 py-4 flex flex-col space-y-3">
            <Link
              href="/home"
              className="text-black font-medium hover:text-gray-700 transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/jobs"
              className="text-black font-medium hover:text-gray-700 transition"
              onClick={() => setIsOpen(false)}
            >
              Jobs
            </Link>
            <Link
              href="/my-network"
              className="text-black font-medium hover:text-gray-700 transition"
              onClick={() => setIsOpen(false)}
            >
              My Network
            </Link>
            <Link
              href="/profile"
              className="text-black font-medium hover:text-gray-700 transition"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/logout"
              className="text-black font-medium hover:text-gray-700 transition"
              onClick={() => setIsOpen(false)}
            >
              Logout
            </Link>
          </div>
        </div>
      )}

      {/* ✅ Mobile Notification Dropdown */}
      {showNotif && (
        <div className="md:hidden absolute right-4 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn">
          <div className="p-3 border-b font-semibold text-gray-800">
            Notifications
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm p-3">No new notifications</p>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={i}
                  className="p-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {n}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
