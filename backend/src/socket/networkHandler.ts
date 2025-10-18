
import { Server, Socket } from "socket.io";
import { prisma } from "../prisma";

export function registerNetworkHandlers(io: Server, socket: Socket) {
  socket.on("getAllUsers", async (_, cb) => {
    const users = await prisma.user.findMany({
      include: { profile: true },
    });
    cb({ status: "ok", users });
  });

  socket.on("sendConnectionRequest", async ({ receiverId }, cb) => {
    const senderId = (socket as any).data.userId;
    if (!senderId) return cb({ status: "error", message: "Not authenticated" });

    await prisma.connection.create({
      data: { requesterId: senderId, receiverId, status: "pending" },
    });

    await prisma.notification.create({
      data: {
        userId: receiverId,
        message: "📨 You received a new connection request!",
      },
    });

    io.to(`user:${receiverId}`).emit("notification:new", {
      message: "📨 You received a new connection request!",
    });

    cb({ status: "ok" });
  });

  socket.on("respondConnectionRequest", async ({ connectionId, action }, cb) => {
    const connection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: action },
    });

    const otherUserId =
      action === "accepted" ? connection.requesterId : connection.receiverId;

    await prisma.notification.create({
      data: {
        userId: otherUserId,
        message:
          action === "accepted"
            ? "✅ Your connection request was accepted!"
            : "❌ Your connection request was rejected!",
      },
    });

    io.to(`user:${otherUserId}`).emit("notification:new", {
      message:
        action === "accepted"
          ? "✅ Your connection request was accepted!"
          : "❌ Your connection request was rejected!",
    });

    cb({ status: "ok" });
  });
}
