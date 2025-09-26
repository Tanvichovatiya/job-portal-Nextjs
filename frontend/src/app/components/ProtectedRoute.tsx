// components/ProtectedRoute.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getToken, getUserRole } from "../../../lib/auth";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const router = useRouter();

 useEffect(() => {
  const token = getToken();
  const role = getUserRole();

  

  if (!token) {
    router.push("/login");
    return;
  }

  if (requiredRole && role !== requiredRole) {
    console.log("protected route not allowed");
    router.push("/");
    return;
  }
}, [router, requiredRole]);

  return <>{children}</>;
}
