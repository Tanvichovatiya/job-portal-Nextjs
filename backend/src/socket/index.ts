
// src/socket/index.ts
import { Server as IOServer, Socket } from "socket.io";
import { verifyToken } from "../utils/auth";
import { registerAuthHandlers } from "./authHandlers";
import { registerJobHandlers } from "./jobHandlers";
import { TokenExpiredError } from "jsonwebtoken";
import { registerApplicationHandlers } from "./applicationHandler";
import { registerProfileHandlers } from "./profileHandler";
import { registerNetworkHandlers } from "./networkHandler";
import { registerCompanyProfileHandlers } from "./companyProfileHandler";
import { prisma } from "../prisma";
// import { registerApplicationHandlers } from "./applicationHandlers"; // optional if you have it

export function initSocket(io: IOServer) {
  // middleware: read token from handshake.auth.token and attach to socket.data
  // io.use((socket, next) => {
  //   const token = (socket.handshake.auth as any)?.token;
  //   console.log(token)
  //   if (token) {
  //     const res = verifyToken(token);
  //     console.log(res);
  //     if (res.ok) {
  //       (socket as any).data.userId = (res.payload as any).userId;
  //       (socket as any).data.role = (res.payload as any).role;
  //     }
  //   }
  //   next();
  // });

  // src/socket/index.ts
io.on("connection", (socket: Socket) => {
  console.log("Socket connected:", socket.id);

  // Authenticate event
 

socket.on("authenticate", async (token: string, cb: (res: any) => void) => {
  try {
    const res = verifyToken(token);
    if (!res.ok) {
      cb({ status: "error", message: "Invalid token" });
      return;
    }

    // token payload may use different keys (id, userId). Handle both.
    const payload: any = res.payload || {};
    const userId = payload.userId || payload.id || payload.sub;
    if (!userId) {
      cb({ status: "error", message: "Token missing user id" });
      return;
    }

    // set userId
    (socket as any).data.userId = userId;
    socket.join(`user:${userId}`);

    // set role: try token payload first, otherwise fetch from DB
    let role = payload.role;
    if (!role) {
      try {
        const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        role = u?.role;
      } catch (e) {
        console.warn("Failed to fetch role from db:", e);
      }
    }

    (socket as any).data.role = role;
    console.log(`Socket ${socket.id} authenticated for userId: ${userId} role: ${role}`);

    cb({ status: "ok", userId, role });
  } catch (err) {
    console.error("authenticate error:", err);
    cb({ status: "error", message: "Invalid token" });
  }
});



  // Register your handlers
  registerAuthHandlers(io, socket);
  registerJobHandlers(io, socket);
  registerApplicationHandlers(io, socket);
  registerProfileHandlers(io, socket);
  registerNetworkHandlers(io, socket);
  registerCompanyProfileHandlers(io, socket);

});

}
