"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateSocket, socket } from "../../../lib/socket";
import { setAuth } from "../../../lib/auth";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const validate = () => {
    if (!email.trim()) return "Please enter your email.";
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    if (!password) return "Please enter your password.";
    return null;
  };

  const handleLogin = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    socket.emit("login", { email, password, role }, (res: any) => {
      if (res.status === "ok") {
        setAuth(res.token, { name: res.user.name, role: res.user.role });
        authenticateSocket(res.token);
        if (role === "company") {
          router.push("/dashboard");
        } else {
          router.push("/user");
        }
      } else {
        setErrorMessage(res.message || "Login failed. Please check your credentials.");
      }
      setIsSubmitting(false);
    });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h3 className="mb-1">Welcome back</h3>
              <p className="text-muted mb-4">Sign in to continue.</p>

              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleLogin} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="role" className="form-label">Sign in as</label>
                  <select
                    id="role"
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="company">Company</option>
                  </select>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted">New here? </span>
                <Link className="link-primary" href="/register">Create an account</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
