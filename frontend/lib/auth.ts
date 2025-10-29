// lib/auth.ts

// Save token + user details in localStorage
export function setAuth(token: string, user: { id: string; name: string; role: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user)); // store id, name & role together
}

// Get token
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Get logged-in user's ID
export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    const parsedUser = JSON.parse(user);
    return parsedUser.id || parsedUser._id || null; // support both id & _id
  } catch {
    return null;
  }
}

// Get logged-in user's role
export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    const parsedUser = JSON.parse(user);
    return parsedUser.role || null;
  } catch {
    return null;
  }
}

// Clear auth (logout)
export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Get both token and user object
// lib/auth.ts

export function getAuth(): { token: string | null; user: { id: string; name: string; role: string } | null } {
  if (typeof window === "undefined") {
    // Prevent errors during SSR in Next.js
    return { token: null, user: null };
  }

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  try {
    const user = userData ? JSON.parse(userData) : null;
    return { token, user };
  } catch {
    // if parsing fails, clear bad data
    localStorage.removeItem("user");
    return { token, user: null };
  }
}
