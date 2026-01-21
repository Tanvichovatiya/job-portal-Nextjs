import { Server as IOServer, Socket } from "socket.io";
import { verifyToken } from "../utils/auth";
import { registerAuthHandlers } from "./authHandlers";
import { registerJobHandlers } from "./jobHandlers";
import { registerApplicationHandlers } from "./applicationHandler";
import { registerProfileHandlers } from "./profileHandler";
import { registerNetworkHandlers } from "./networkHandler";
import { registerCompanyProfileHandlers } from "./companyProfileHandler";
import { prisma } from "../prisma";

export function initSocket(io: IOServer) {
  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    /**
     * 🔐 Authenticate socket
     */
    socket.on("authenticate", async (token: string, cb: (res: any) => void) => {
      try {
        const res = verifyToken(token);
        if (!res.ok) {
          cb({ status: "error", message: "Invalid token" });
          return;
        }

        const payload: any = res.payload || {};
        const userId = payload.userId || payload.id || payload.sub;
        if (!userId) {
          cb({ status: "error", message: "Token missing userId" });
          return;
        }

        // Attach to socket
        (socket as any).data.userId = userId;
        socket.join(`user:${userId}`);

        // Resolve role
        let role = payload.role;
        if (!role) {
          const u = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          });
          role = u?.role;
        }

        (socket as any).data.role = role;

        console.log(`✅ Socket authenticated: ${userId}`);

        cb({ status: "ok", userId, role });
      } catch (err) {
        console.error("authenticate error:", err);
        cb({ status: "error", message: "Invalid token" });
      }
    });

    /**
     * ✅ Register handlers
     */
    registerAuthHandlers(io, socket);
    registerJobHandlers(io, socket);
    registerApplicationHandlers(io, socket);
    registerProfileHandlers(io, socket);
    registerNetworkHandlers(io, socket);
    registerCompanyProfileHandlers(io, socket);
   
  });
}
