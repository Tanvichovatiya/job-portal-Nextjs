// components/SocketProvider.tsx
"use client";
import { useEffect } from "react";
import { socket } from "../../../lib/socket";
import { getToken } from "../../../lib/auth";


export default function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = getToken();
    if (token) socket.auth = { token };
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
}
