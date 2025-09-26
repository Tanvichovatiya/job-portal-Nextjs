// lib/socket.ts
import { io } from "socket.io-client";

export const socket = io("http://localhost:4000"); // connect first

export function authenticateSocket(token: string) {
  socket.emit("authenticate", token, (res: any) => {
    if (res.status === "ok") console.log("Socket authenticated!");
    else console.error("Socket authentication failed");
  });
}
