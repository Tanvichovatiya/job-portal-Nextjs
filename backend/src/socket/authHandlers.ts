// src/socket/authHandlers.ts
import { Server, Socket } from "socket.io";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import { signToken } from "../utils/auth";
import { safeUser } from "../utils/helpers";

export function registerAuthHandlers(io: Server, socket: Socket) {
  socket.on("register", async (payload: any, cb: (res: any) => void) => {
    try {
      const existing = await prisma.user.findUnique({ where: { email: payload.email } });
      if (existing) return cb({ status: "error", message: "Email already in use" });

      const hashed = await bcrypt.hash(payload.password, 10);
      const user = await prisma.user.create({
        data: { name: payload.name, email: payload.email, password: hashed, role: payload.role },
      });

      const token = signToken({ userId: user.id, role: user.role });
      cb({ status: "ok", token, user: safeUser(user) });
    } catch (err: any) {
      console.error(err);
      cb({ status: "error", message: err.message || "Registration failed" });
    }
  });

  socket.on("login", async (payload: any, cb: (res: any) => void) => {
    try {
      const user = await prisma.user.findUnique({ where: { email: payload.email } });
      if (!user) return cb({ status: "error", message: "Invalid credentials" });

      const ok = await bcrypt.compare(payload.password, user.password);
      if (!ok) return cb({ status: "error", message: "Invalid credentials" });

      const token = signToken({ userId: user.id, role: user.role });
      cb({ status: "ok", token, user: safeUser(user) });
    } catch (err: any) {
      console.error(err);
      cb({ status: "error", message: err.message || "Login failed" });
    }
  });

  // Optional: logout acknowledgement (JWT is stateless, but we can still ack)
  socket.on("logout", async (_: any, cb: (res: any) => void) => {
    try {
      cb({ status: "ok" });
    } catch (err: any) {
      console.error(err);
      cb({ status: "error", message: err.message || "Logout failed" });
    }
  });
}
