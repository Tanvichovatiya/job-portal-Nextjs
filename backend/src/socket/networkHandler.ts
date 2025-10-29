import { Server, Socket } from "socket.io";
import { prisma } from "../prisma";

// Helper: Require Auth
function requireAuth(socket: Socket) {
  const userId = (socket as any).data?.userId;
  if (!userId) throw new Error("Unauthenticated user");
  return userId as string;
}

export function registerNetworkHandlers(io: Server, socket: Socket) {
  // ✅ Get All Users
  // ✅ Get All Users (only role == 'user')
socket.on("getAllUsers", async (_payload, cb) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "user" }, // 🟢 Only fetch normal users
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: {
          select: {
            headline: true,
            avatar: true,
            location: true,
            skills: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    cb?.({ status: "ok", users });
  } catch (err: any) {
    console.error("getAllUsers error", err);
    cb?.({ status: "error", message: err.message });
  }
});


  // ✅ Send Connection Request (A → B)
  socket.on("sendConnectionRequest", async ({ receiverId }, cb) => {
    try {
      const requesterId = requireAuth(socket);
      if (requesterId === receiverId)
        return cb?.({ status: "error", message: "Cannot connect to yourself" });

      const connection = await prisma.connection.create({
        data: { requesterId, receiverId, status: "pending" },
      });

      const requester = await prisma.user.findUnique({
        where: { id: requesterId },
        select: { name: true },
      });

      // Create notification only for receiver (B)
      const notif = await prisma.notification.create({
        data: {
          userId: receiverId,
          message: `📨 ${requester?.name} sent you a connection request`,
          connectionId: connection.id,
          read: false,
        },
      });

      io.to(`user:${receiverId}`).emit("notification:new", { notification: notif });

      cb?.({ status: "ok", connection, notification: notif });
    } catch (err: any) {
      console.error(err);
      cb?.({ status: "error", message: err.message });
    }
  });

  // ✅ Respond Connection Request (Accept / Ignore)
 socket.on("respondConnectionRequest", async ({ connectionId, action }, cb) => {
  try {
    const userId = requireAuth(socket); // B (the one responding)
    const conn = await prisma.connection.findUnique({ where: { id: connectionId } });
    if (!conn) return cb?.({ status: "error", message: "Connection not found" });
    if (conn.receiverId !== userId)
      return cb?.({ status: "error", message: "Not authorized" });

    const receiver = await prisma.user.findUnique({ where: { id: userId } });
    const requesterId = conn.requesterId; // A

    // ✅ Step 1: Update or delete connection based on action
    if (action === "accepted") {
      await prisma.connection.update({
        where: { id: connectionId },
        data: { status: "accepted" },
      });
    } else if (action === "rejected") {
      await prisma.connection.delete({ where: { id: connectionId } });
    }

    // ✅ Step 2: Remove the "connection request" notification from B's side only
    await prisma.notification.deleteMany({
      where: { connectionId, userId }, // ensure only B’s notification is deleted
    });

    // Emit to B to remove from their UI immediately
    io.to(`user:${userId}`).emit("notification:removedConnection", { connectionId });

    // ✅ Step 3: Create a notification for A (the requester)
    // (this will persist and show only on A’s side)
    const notif = await prisma.notification.create({
      data: {
        userId: requesterId, // send to A
        connectionId, // optional, can help track
        message:
          action === "accepted"
            ? `✅ ${receiver?.name} accepted your connection request`
            : `❌ ${receiver?.name} ignored your connection request`,
        read: false,
      },
    });

    // ✅ Step 4: Emit to A only (not to B)
   if(io.to(`user:${requesterId}`).emit("notification:new", { notification: notif })){
    console.log("Notification sent to requester");
   }

  

    cb?.({ status: "ok" });
  } catch (err: any) {
    console.error("respondConnectionRequest error", err);
    cb?.({ status: "error", message: err.message });
  }
});


  // ✅ Get Notifications
  socket.on("getNotifications", async (_payload, cb) => {
    try {
      const userId = requireAuth(socket);
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      cb?.({ status: "ok", notifications });
    } catch (err: any) {
      console.error(err);
      cb?.({ status: "error", message: err.message });
    }
  });

  // ✅ Mark notification as read
  socket.on("markNotificationRead", async ({ notificationId }, cb) => {
    try {
      const userId = requireAuth(socket);
      const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
      if (!notif || notif.userId !== userId)
        return cb?.({ status: "error", message: "Not found or unauthorized" });

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      io.to(`user:${userId}`).emit("notification:read", { notificationId });
      cb?.({ status: "ok", notification: updated });
    } catch (err: any) {
      console.error(err);
      cb?.({ status: "error", message: err.message });
    }
  });

  // ✅ Delete notification
  socket.on("deleteNotification", async ({ notificationId }, cb) => {
    try {
      const userId = requireAuth(socket);
      const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
      if (!notif || notif.userId !== userId)
        return cb?.({ status: "error", message: "Not found or unauthorized" });

      await prisma.notification.delete({ where: { id: notificationId } });
      io.to(`user:${userId}`).emit("notification:removed", { notificationId });
      cb?.({ status: "ok" });
    } catch (err: any) {
      console.error(err);
      cb?.({ status: "error", message: err.message });
    }
  });
}
