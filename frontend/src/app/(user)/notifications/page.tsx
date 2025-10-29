"use client";
import { useEffect, useState } from "react";
import { socket } from "../../../../lib/socket";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch notifications
    socket.emit("getNotifications", {}, (res: any) => {
      if (res.status === "ok") setNotifications(res.notifications);
      
    });

    // Real-time listeners
   socket.on("notification:new", ({ notification }) => {
  // Ignore if notification not for current user
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  if (!currentUser || notification.userId !== currentUser.id) return;

  setNotifications((prev) => [notification, ...prev]);
});


    socket.on("notification:read", ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        
      );
     
    });

    socket.on("notification:removed", ({ notificationId }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
    });

    socket.on("notification:removedConnection", ({ connectionId }) => {
      setNotifications((prev) =>
        prev.filter((n) => n.connectionId !== connectionId)
      );
      
    });

    return () => {
      socket.off("notification:new");
      socket.off("notification:read");
      socket.off("notification:removed");
      socket.off("notification:removedConnection");
    };
  }, []);

  const markAsRead = (id: string) => {
    socket.emit("markNotificationRead", { notificationId: id });
  };

  const deleteNotification = (id: string) => {
    socket.emit("deleteNotification", { notificationId: id });
  };

  const respondConnection = (notif: any, action: "accepted" | "rejected") => {
    if (!notif.connectionId) return alert("No connection ID found");

    socket.emit(
      "respondConnectionRequest",
      { connectionId: notif.connectionId, action },
      (res: any) => {
        if (res.status === "ok") {
          // Remove from B side immediately
          setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
        } else {
          alert(res.message || "Action failed");
        }
      }
    );
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-6">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-3 mb-2 border rounded ${
                  n.read ? "bg-white" : "bg-gray-50"
                } flex justify-between items-start`}
              >
                <div>
                  <p>{n.message}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>

                  {n.message.includes("sent you a connection request") && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => respondConnection(n, "accepted")}
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondConnection(n, "rejected")}
                        className="bg-gray-300 text-gray-800 text-xs px-3 py-1 rounded hover:bg-gray-400"
                      >
                        Ignore
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 ml-4">
                  {!n.read &&
                    !n.message.includes("sent you a connection request") && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </>
  );
}
