
// src/socket/companyProfileHandler.ts
import { Server, Socket } from "socket.io";
import { prisma } from "../prisma";
import { uploadBase64Raw } from "../utils/cloudinary";

function requireAuth(socket: Socket) {
  const userId = (socket as any).data?.userId;
  if (!userId) throw new Error("Unauthenticated");
  return userId;
}

export function registerCompanyProfileHandlers(io: Server, socket: Socket) {
  /** 🔹 Get company profile */
  socket.on("getCompanyProfile", async (payload, cb) => {
    try {
      const targetUserId = payload?.userId || (socket as any).data?.userId;
      if (!targetUserId) return cb({ status: "error", message: "No userId provided" });

      const profile = await prisma.companyProfile.findUnique({
        where: { userId: targetUserId },
        include: { user: true },
      });

      if (!profile) return cb({ status: "error", message: "Company profile not found" });

      cb({ status: "ok", profile });
    } catch (err: any) {
      console.error("getCompanyProfile error:", err);
      cb({ status: "error", message: err.message });
    }
  });

  /** 🔹 Save or update company profile */
  socket.on("saveCompanyProfile", async (payload, cb) => {
    try {
      const userId = requireAuth(socket);
      const {
        companyName,
        description,
        location,
        website,
        industry,
        employees,
        foundedYear,
        logoBase64,
      } = payload;
      console.log("saveCompanyProfile payload:", payload);
      let logoUrl;
      if (logoBase64) logoUrl = await uploadBase64Raw(logoBase64, "company-logos");

      const profile = await prisma.companyProfile.upsert({
        where: { userId },
        create: {
          userId,
          companyName,
          description,
          location,
          website,
          industry,
          employees,
          foundedYear,
          logo: logoUrl || null,
        },
        update: {
          companyName,
          description,
          location,
          website,
          industry,
          employees,
          foundedYear,
          logo: logoUrl || undefined,
        },
      });

      io.to(`user:${userId}`).emit("companyProfile:updated", { profile });
      cb({ status: "ok", profile });
    } catch (err: any) {
      console.error("saveCompanyProfile error:", err);
      cb({ status: "error", message: err.message });
    }
  });
}
