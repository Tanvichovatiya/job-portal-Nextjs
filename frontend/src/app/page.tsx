"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "./components/RegisterForm";
import { getAuth } from "../../lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const { token, user } = getAuth();

    if (token && user) {
      // Redirect based on role
      if (user.role === "company") router.push("/dashboard");
      else router.push("/user");
    }
  }, [router]);

  return (
    <div className="container mt-5">
      
      <RegisterForm />
    </div>
  );
}
