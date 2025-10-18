// lib/socket.ts
import { io } from "socket.io-client";

// ✅ Create a persistent socket connection
export const socket = io("http://localhost:4000", {
  autoConnect: true, // will connect immediately
  transports: ["websocket"], // force websocket (faster, stable)
});

// ✅ Authenticate socket with JWT
export function authenticateSocket(token: string) {
  socket.emit("authenticate", token, (res: any) => {
    if (res.status === "ok") {
      console.log("✅ Socket authenticated!");
    } else {
      console.error("❌ Socket authentication failed:", res.message);
    }
  });
}
