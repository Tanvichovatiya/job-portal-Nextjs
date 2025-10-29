import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_API_URL, { transports: ["websocket"] });

export function authenticateSocket(token: string) {
  if (!socket.connected) socket.connect();

  socket.emit("authenticate", token, (res: any) => {
    if (res.status === "ok") console.log("✅ Socket authenticated successfully");
    else console.error("❌ Socket authentication failed:", res.message);
  });
}



export function getProfileById(userId: string, callback: (res: any) => void) {
  socket.emit("getProfileById", { userId }, callback);
}
