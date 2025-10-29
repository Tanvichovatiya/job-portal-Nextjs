"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_1 = require("./socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000", // your Next.js frontend
    methods: ["GET", "POST"],
    credentials: true,
}));
app.get("/", (_req, res) => res.send({ ok: true, message: "Job portal socket server is running" }));
const PORT = Number(process.env.PORT || 4000);
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ["websocket", "polling"], // allow fallback
});
(0, socket_1.initSocket)(io);
httpServer.listen(PORT, () => {
    console.log(`Socket server listening on port ${PORT}`);
});
//# sourceMappingURL=server.js.map