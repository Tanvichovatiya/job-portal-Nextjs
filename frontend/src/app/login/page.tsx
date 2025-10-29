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
      setIsSubmitting(false);

      if (res.status === "ok") {
        alert("Login successful!");
        setAuth(res.token, {
          id: res.user.id || res.user._id,
          name: res.user.name,
          role: res.user.role,
        });

        authenticateSocket(res.token);

        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          
          if (parsed.role === "company") router.push("/dashboard");
          else router.push("/home");
        }
      } else {
        setErrorMessage(
          res.message || "Login failed. Please check your credentials."
        );
      }
    });
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: "url('/bg1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: "100%",
          maxWidth: "460px",
          borderRadius: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <div className="card-body p-4 p-md-5">
          <h2 className="text-center mb-3 fw-bold text-primary">
            Welcome back
          </h2>
          <p className="text-center text-muted mb-4">
            Sign in to continue your journey.
          </p>

          {errorMessage && (
            <div className="alert alert-danger text-center" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="role" className="form-label fw-semibold">
                Sign in as
              </label>
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

            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary fw-semibold py-2"
                style={{ borderRadius: "10px" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">New here? </span>
            <Link className="link-primary fw-semibold" href="/register">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
