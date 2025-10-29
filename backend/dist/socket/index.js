"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
const auth_1 = require("../utils/auth");
const authHandlers_1 = require("./authHandlers");
const jobHandlers_1 = require("./jobHandlers");
const applicationHandler_1 = require("./applicationHandler");
const profileHandler_1 = require("./profileHandler");
const networkHandler_1 = require("./networkHandler");
const companyProfileHandler_1 = require("./companyProfileHandler");
// import { registerApplicationHandlers } from "./applicationHandlers"; // optional if you have it
function initSocket(io) {
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
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
        // Authenticate event
        socket.on("authenticate", (token, cb) => {
            try {
                const res = (0, auth_1.verifyToken)(token);
                if (res.ok) {
                    socket.data.userId = res.payload.userId;
                    socket.join(`user:${res.payload.userId}`);
                    cb({ status: "ok" });
                    console.log(`Socket ${socket.id} authenticated for userId: ${res.payload.userId}`);
                }
                else {
                    cb({ status: "error", message: "Invalid token" });
                }
            }
            catch {
                cb({ status: "error", message: "Invalid token" });
            }
        });
        // Register your handlers
        (0, authHandlers_1.registerAuthHandlers)(io, socket);
        (0, jobHandlers_1.registerJobHandlers)(io, socket);
        (0, applicationHandler_1.registerApplicationHandlers)(io, socket);
        (0, profileHandler_1.registerProfileHandlers)(io, socket);
        (0, networkHandler_1.registerNetworkHandlers)(io, socket);
        (0, companyProfileHandler_1.registerCompanyProfileHandlers)(io, socket);
    });
}
//# sourceMappingURL=index.js.map