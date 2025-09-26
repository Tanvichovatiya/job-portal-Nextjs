import { json } from "stream/consumers";

// lib/auth.ts
export function setAuth(token: string, user: { name: string; role: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user)); // store both name & role together
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId");
}

export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    const parsedUser = JSON.parse(user);
    return parsedUser.role || null;
  } catch (e) {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("user");
}
// lib/auth.ts
export function getAuth() {
  if (typeof window === "undefined") {
    return { token: null, user: null }; // avoid server-side errors
  }

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return { token, user: user ? JSON.parse(user) : null };
}
