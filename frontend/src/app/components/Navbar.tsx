"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAuth } from "../../../lib/auth";
import { authenticateSocket, socket } from "../../../lib/socket";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { token } = getAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!token) return;

    // Authenticate socket
    authenticateSocket(token);

    // Fetch all notifications on load
    socket.emit("getNotifications", {}, (res: any) => {
      if (res.status === "ok") {
        const unread = res.notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    });

    // ✅ Handle new incoming notification (only increases when for current user)
    const handleNew = ({ notification }: any) => {
      setUnreadCount((prev) => prev + 1);
    };

    // ✅ Handle notification marked as read
    const handleRead = ({ notificationId }: any) => {
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    };

    // ✅ Handle notification deleted manually
    const handleRemoved = ({ notificationId }: any) => {
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    };

    // ✅ Handle "respondConnectionRequest" cleanup (B accepted/ignored)
    const handleRemovedConnection = ({ connectionId }: any) => {
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    };

    socket.on("notification:new", handleNew);
    socket.on("notification:read", handleRead);
    socket.on("notification:removed", handleRemoved);
    socket.on("notification:removedConnection", handleRemovedConnection);

    return () => {
      socket.off("notification:new", handleNew);
      socket.off("notification:read", handleRead);
      socket.off("notification:removed", handleRemoved);
      socket.off("notification:removedConnection", handleRemovedConnection);
    };
  }, [token]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center">
            <Image
              src="/logo/logo.png"
              alt="Logo"
              width={120}
              height={45}
              className="rounded"
            />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { href: "/home", label: "Home" },
              { href: "/jobs", label: "Jobs" },
              { href: "/my-network", label: "My Network" },
              { href: "/profile", label: "Profile" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-black font-medium hover:text-gray-700 ${
                  pathname === link.href ? "underline" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative text-black font-medium hover:text-gray-700"
            >
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/logout"
              className="text-black font-medium hover:text-gray-700"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
