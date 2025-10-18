"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { socket, authenticateSocket } from "../../../lib/socket";
import { setAuth } from "../../../lib/auth";
import Link from "next/link";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const validate = () => {
    if (!name.trim()) return "Please enter your name.";
    if (!email.trim()) return "Please enter your email.";
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleRegister = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    socket.emit("register", { name, email, password, role }, (res: any) => {
      setIsSubmitting(false);

      if (res.status === "ok") {
        setAuth(res.token, {
          id: res.user.id || res.user._id,
          name: res.user.name,
          role: res.user.role,
        });
        authenticateSocket(res.token);

        if (role === "company") router.push("/dashboard");
        else router.push("/home");
      } else {
        setErrorMessage(res.message || "Registration failed. Please try again.");
      }
    });
  };

  return (
    <div
      className="min-vh-100 h-full w-full d-flex align-items-center justify-content-center"
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
          maxWidth: "480px",
          borderRadius: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <div className="card-body pt-2 p-4  p-md-5">
          <h2 className="text-center mb-3 fw-bold text-primary">
            Create your account
          </h2>
          <p className="text-center text-muted mb-4">
            Join and start exploring opportunities.
          </p>

          {errorMessage && (
            <div className="alert alert-danger text-center" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleRegister} noValidate>
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-semibold">
                Full Name
              </label>
              <input
                id="name"
                className="form-control"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email Address
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="password"
                minLength={6}
                required
              />
              <div className="form-text">At least 6 characters.</div>
            </div>

            <div className="mb-4">
              <label htmlFor="role" className="form-label fw-semibold">
                Register as
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <Link className="link-primary fw-semibold" href="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
