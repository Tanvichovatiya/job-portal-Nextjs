
// src/server.ts
import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { initSocket } from "./socket";


dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "*",
  })
);

app.get("/", (_req, res) => res.send({ ok: true, message: "Job portal socket server is running" }));

const PORT = Number(process.env.PORT || 4000);
const httpServer = http.createServer(app);
const io = new IOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

initSocket(io);
httpServer.listen(PORT, () => {
  console.log(`Socket server listening on http://localhost:${PORT}`);
});
