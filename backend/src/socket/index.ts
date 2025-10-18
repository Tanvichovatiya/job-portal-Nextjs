
// src/socket/index.ts
import { Server as IOServer, Socket } from "socket.io";
import { verifyToken } from "../utils/auth";
import { registerAuthHandlers } from "./authHandlers";
import { registerJobHandlers } from "./jobHandlers";
import { TokenExpiredError } from "jsonwebtoken";
import { registerApplicationHandlers } from "./applicationHandler";
import { registerProfileHandlers } from "./profileHandler";
import { registerNetworkHandlers } from "./networkHandler";
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
  socket.on("authenticate", (token: string, cb: (res: any) => void) => {
    try {
      const res = verifyToken(token); // verify JWT
      if (res.ok) {
        (socket as any).data.userId = res.payload.userId;
        (socket as any).data.role = res.payload.role;

        // Join private room for this user
        socket.join(`user:${res.payload.userId}`);

        cb({ status: "ok" });
        console.log(`Socket ${socket.id} authenticated for userId: ${res.payload.userId}`);
      } else {
        cb({ status: "error", message: "Invalid token" });
      }
    } catch (err) {
      cb({ status: "error", message: "Invalid token" });
    }
  });

  // Register your handlers
  registerAuthHandlers(io, socket);
  registerJobHandlers(io, socket);
  registerApplicationHandlers(io, socket);
  registerProfileHandlers(io, socket);
  registerNetworkHandlers(io, socket);
});

}
