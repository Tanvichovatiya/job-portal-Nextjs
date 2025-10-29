// app/my-network/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useRouter } from "next/navigation";
import { authenticateSocket, socket } from "../../../../lib/socket";
import { getAuth } from "../../../../lib/auth";

type UserItem = {
  id: string;
  name: string;
  profile?: { avatar?: string; headline?: string };
};

type Connection = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: string;
};

export default function MyNetwork() {
  const { token, user } = getAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) authenticateSocket(token);

    socket.emit("getAllUsers", {}, (res: any) => {
      if (res.status === "ok") {
        setUsers(res.users);
      }
    });

    socket.emit("getConnectionsForUser", {}, (res: any) => {
      if (res.status === "ok") {
        setConnections(res.connections);
      }
      setLoading(false);
    });

    socket.on("connection:updated", ({ connection }) => {
      setConnections(prev => {
        const idx = prev.findIndex(c => c.id === connection.id);
        if (idx >= 0) {
          const newArr = [...prev];
          newArr[idx] = connection;
          return newArr;
        }
        return [connection, ...prev];
      });
    });

    return () => {
      socket.off("connection:updated");
    };
  }, [token]);

  const myId = user?.id;

  const getConnStatus = (otherId: string) => {
    const conn = connections.find(c =>
      (c.requesterId === myId && c.receiverId === otherId) ||
      (c.requesterId === otherId && c.receiverId === myId)
    );
    if (!conn) return "none";
    if (conn.status === "pending") {
      return conn.requesterId === myId ? "pending_sent" : "pending_received";
    }
    if (conn.status === "accepted") return "connected";
    if (conn.status === "rejected") return "rejected";
    return "none";
  };

  const handleConnect = (receiverId: string) => {
    socket.emit("sendConnectionRequest", { receiverId }, (res: any) => {
      if (res.status === "ok") {
        alert("Request sent");
      } else alert(res.message);
    });
  };

  const handleAccept = (connectionId: string) => {
    socket.emit("respondConnectionRequest", { connectionId, action: "accepted" }, (res: any) => {
      if (res.status === "ok") {
        alert("Connected");
      } else alert(res.message);
    });
  };

  const handleReject = (connectionId: string) => {
    socket.emit("respondConnectionRequest", { connectionId, action: "rejected" }, (res: any) => {
      if (res.status === "ok") {
        alert("Rejected");
      } else alert(res.message);
    });
  };

  const handleViewProfile = (id: string) => {
    router.push(`/profile/${id}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-semibold mb-6">My Network</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {users.map(u => {
              if (u.id === myId) return null;
              const status = getConnStatus(u.id);
              const conn = connections.find(c =>
                (c.requesterId === myId && c.receiverId === u.id) ||
                (c.requesterId === u.id && c.receiverId === myId)
              );

              return (
                <div key={u.id} className="bg-white shadow rounded-lg p-4 flex flex-col items-center">
                  <img
                    src={u.profile?.avatar || "/default-avatar.png"}
                    alt={u.name}
                    className="w-20 h-20 rounded-full object-cover mb-3"
                  />
                  <h2 className="text-lg font-medium">{u.name}</h2>
                  <p className="text-sm text-gray-500 mb-3">{u.profile?.headline || ""}</p>

                  <div className="flex gap-2">
                    {status === "none" && (
                      <button
                        onClick={() => handleConnect(u.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded">
                        Connect
                      </button>
                    )}
                    {status === "pending_sent" && (
                      <button disabled className="bg-gray-200 text-gray-500 px-3 py-1 rounded">
                        Request Sent
                      </button>
                    )}
                    {status === "pending_received" && conn && (
                      <><button
                        onClick={() => handleAccept(conn.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded">
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(conn.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded">
                        Reject
                      </button></>
                    )}
                    {status === "connected" && (
                      <button disabled className="bg-gray-800 text-white px-3 py-1 rounded">
                        Connected
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleViewProfile(u.id)}
                    className="mt-3 text-blue-600 text-sm underline">
                    View Profile
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
