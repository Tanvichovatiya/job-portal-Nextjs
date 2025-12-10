// src/socket/profileHandler.ts
import { Server, Socket } from "socket.io";
import { prisma } from "../prisma";
import { v4 as uuidv4 } from "uuid";
import { uploadBase64Raw } from "../utils/cloudinary";

// Helper to require authentication
function requireAuth(socket: Socket) {
  const userId = (socket as any).data?.userId;
  if (!userId) throw new Error("Unauthenticated");
  return userId as string;
}

export function registerProfileHandlers(io: Server, socket: Socket) {
  /** 🔹 Get my profile (authenticated user) */
  socket.on("getProfile", async (payload, cb) => {
    try {
      const targetUserId = payload?.userId || (socket as any).data?.userId;
      if (!targetUserId) return cb({ status: "error", message: "No userId provided" });

      const profile = await prisma.profile.findUnique({
        where: { userId: targetUserId },
        include: { user: true },
      });

      if (!profile) return cb({ status: "error", message: "Profile not found" });

      cb({ status: "ok", profile });
    } catch (err: any) {
      console.error("getProfile error:", err);
      cb({ status: "error", message: err.message });
    }
  });

  /** 🔹 Get profile by userId (any user) */
  socket.on("getProfileById", async ({ userId }, cb) => {
    try {
      if (!userId) return cb({ status: "error", message: "userId is required" });

      const profile = await prisma.profile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!profile) return cb({ status: "error", message: "Profile not found" });

      cb({ status: "ok", profile });
    } catch (err: any) {
      console.error("getProfileById error:", err);
      cb({ status: "error", message: "Something went wrong" });
    }
  });

  /** 🔹 Save/update profile */
 socket.on("saveProfile", async (payload, cb) => {
  try {
    const userId = requireAuth(socket);

    const {
      headline,
      about,
      location,
      website,
      skills,
      avatarBase64,
      education,
      experience,
    } = payload || {};

    let avatarUrl;
    if (avatarBase64) {
      avatarUrl = await uploadBase64Raw(avatarBase64, "profile-avatars");
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        headline,
        about,
        location,
        website,
        avatar: avatarUrl || null,
        skills: Array.isArray(skills) ? skills : [],
        education: Array.isArray(education) ? education : [],
        experience: Array.isArray(experience) ? experience : [],
      },
      update: {
        headline,
        about,
        location,
        website,
        avatar: avatarUrl || undefined,
        skills: Array.isArray(skills) ? skills : undefined,
        education: Array.isArray(education) ? education : undefined,
        experience: Array.isArray(experience) ? experience : undefined,
      },
    });

    io.to(`user:${userId}`).emit("profile:updated", { profile });
    cb({ status: "ok", profile });
  } catch (err: any) {
    console.error("saveProfile error:", err);
    cb({ status: "error", message: err.message });
  }
});


  /** 🔹 Education CRUD */
  socket.on("addEducation", async (payload, cb) => {
    try {
      const userId = requireAuth(socket);
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile) throw new Error("Profile not found");

      const newItem = { id: uuidv4(), ...payload };
      const updated = await prisma.profile.update({
        where: { userId },
        data: { education: [...(profile.education as any[]), newItem] },
      });
      cb({ status: "ok", education: updated.education });
    } catch (err: any) {
      cb({ status: "error", message: err.message });
    }
  });

  socket.on("updateEducation", async ({ id, changes }, cb) => {
    try {
      const userId = requireAuth(socket);
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile) throw new Error("Profile not found");

      const updatedEdu = (profile.education as any[]).map((e) =>
        e.id === id ? { ...e, ...changes } : e
      );
      const updated = await prisma.profile.update({ where: { userId }, data: { education: updatedEdu } });
      cb({ status: "ok", education: updated.education });
    } catch (err: any) {
      cb({ status: "error", message: err.message });
    }
  });

  socket.on("removeEducation", async ({ id }, cb) => {
    try {
      const userId = requireAuth(socket);
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile) throw new Error("Profile not found");

      const updatedEdu = (profile.education as any[]).filter((e) => e.id !== id);
      const updated = await prisma.profile.update({ where: { userId }, data: { education: updatedEdu } });
      cb({ status: "ok", education: updated.education });
    } catch (err: any) {
      cb({ status: "error", message: err.message });
    }
  });

  /** 🔹 Experience CRUD (same as Education) */
  socket.on("addExperience", async (payload, cb) => {
    try {
      const userId = requireAuth(socket);
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile) throw new Error("Profile not found");

      const newItem = { id: uuidv4(), ...payload };
      const updated = await prisma.profile.update({
        where: { userId },
        data: { experience: [...(profile.experience as any[]), newItem] },
      });
      cb({ status: "ok", experience: updated.experience });
    } catch (err: any) {
      cb({ status: "error", message: err.message });
    }
  });

  socket.on("updateExperience", async ({ id, changes }, cb) => {
    try {
      const userId = requireAuth(socket);
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile) throw new Error("Profile not found");

      const updatedExp = (profile.experience as any[]).map((e) =>
        e.id === id ? { ...e, ...changes } : e
      );
      const updated = await prisma.profile.update({ where: { userId }, data: { experience: updatedExp } });
      cb({ status: "ok", experience: updated.experience });
    } catch (err: any) {
      cb({ status: "error", message: err.message });
    }
  });

  socket.on("removeExperience", async ({ id }, cb) => {
    try {
      const userId = requireAuth(socket);
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile) throw new Error("Profile not found");

      const updatedExp = (profile.experience as any[]).filter((e) => e.id !== id);
      const updated = await prisma.profile.update({ where: { userId }, data: { experience: updatedExp } });
      cb({ status: "ok", experience: updated.experience });
    } catch (err: any) {
      cb({ status: "error", message: err.message });
    }
  });
}
