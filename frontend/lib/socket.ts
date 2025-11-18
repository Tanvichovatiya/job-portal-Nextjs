// lib/socket.ts
import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
  autoConnect: true, // you can also set false and connect manually
  transports: ["websocket"],
});

export function authenticateSocket(token: string): Promise<{ status: string; userId?: string; role?: string; message?: string }> {
  return new Promise((resolve) => {
    if (!token) return resolve({ status: "error", message: "No token" });

    if (!socket.connected) socket.connect();

    socket.emit("authenticate", token, (res: any) => {
      if (res?.status === "ok") {
        console.log("✅ Socket authenticated successfully", res);
        resolve(res);
      } else {
        console.error("❌ Socket authentication failed:", res?.message);
        resolve({ status: "error", message: res?.message || "auth failed" });
      }
    });
  });
}

// helper if you still want callback style functions (optional)
export function getProfileById(userId: string, callback: (res: any) => void) {
  socket.emit("getProfileById", { userId }, callback);
}
