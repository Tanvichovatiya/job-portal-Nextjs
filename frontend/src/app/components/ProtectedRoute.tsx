"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, getUserRole } from "../../../lib/auth";

export default function ProtectedRoute({ children, allowedRoles }: any) {
  const [isAllowed, setIsAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { user } = getAuth();
    const role = getUserRole();

    if (!user || !role) {
      router.push("/login");
      return;
    }

    if (!allowedRoles.includes(role)) {
      router.push("/");
      return;
    }

    setIsAllowed(true);
    setIsLoading(false);
  }, [router, allowedRoles]);

  if (isLoading)
    return <div className="text-center py-10 text-gray-500">Loading...</div>;

  return isAllowed ? children : null;
}
