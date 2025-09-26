"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuth } from "../../../lib/auth";
import { socket } from "../../../lib/socket";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    socket.emit("logout", {}, () => {
      clearAuth();
      router.push("/");
    });
  }, [router]);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted">Signing you out...</p>
        </div>
      </div>
    </div>
  );
}


