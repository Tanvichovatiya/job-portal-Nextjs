"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthHandlers = registerAuthHandlers;
const prisma_1 = require("../prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../utils/auth");
const helpers_1 = require("../utils/helpers");
function registerAuthHandlers(io, socket) {
    socket.on("register", async (payload, cb) => {
        try {
            const existing = await prisma_1.prisma.user.findUnique({ where: { email: payload.email } });
            if (existing)
                return cb({ status: "error", message: "Email already in use" });
            const hashed = await bcrypt_1.default.hash(payload.password, 10);
            const user = await prisma_1.prisma.user.create({
                data: { name: payload.name, email: payload.email, password: hashed, role: payload.role },
            });
            const token = (0, auth_1.signToken)({ userId: user.id, role: user.role });
            cb({ status: "ok", token, user: (0, helpers_1.safeUser)(user) });
        }
        catch (err) {
            console.error(err);
            cb({ status: "error", message: err.message || "Registration failed" });
        }
    });
    socket.on("login", async (payload, cb) => {
        try {
            const user = await prisma_1.prisma.user.findUnique({ where: { email: payload.email } });
            if (!user)
                return cb({ status: "error", message: "Invalid credentials" });
            const ok = await bcrypt_1.default.compare(payload.password, user.password);
            if (!ok)
                return cb({ status: "error", message: "Invalid credentials" });
            const token = (0, auth_1.signToken)({ userId: user.id, role: user.role });
            cb({ status: "ok", token, user: (0, helpers_1.safeUser)(user) });
        }
        catch (err) {
            console.error(err);
            cb({ status: "error", message: err.message || "Login failed" });
        }
    });
    // Optional: logout acknowledgement (JWT is stateless, but we can still ack)
    socket.on("logout", async (_, cb) => {
        try {
            cb({ status: "ok" });
        }
        catch (err) {
            console.error(err);
            cb({ status: "error", message: err.message || "Logout failed" });
        }
    });
}
//# sourceMappingURL=authHandlers.js.map