"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProfileHandlers = registerProfileHandlers;
const prisma_1 = require("../prisma");
const uuid_1 = require("uuid");
const cloudinary_1 = require("../utils/cloudinary");
// Helper to require authentication
function requireAuth(socket) {
    const userId = socket.data?.userId;
    if (!userId)
        throw new Error("Unauthenticated");
    return userId;
}
function registerProfileHandlers(io, socket) {
    /** 🔹 Get my profile (authenticated user) */
    socket.on("getProfile", async (payload, cb) => {
        try {
            const targetUserId = payload?.userId || socket.data?.userId;
            if (!targetUserId)
                return cb({ status: "error", message: "No userId provided" });
            const profile = await prisma_1.prisma.profile.findUnique({
                where: { userId: targetUserId },
                include: { user: true },
            });
            if (!profile)
                return cb({ status: "error", message: "Profile not found" });
            cb({ status: "ok", profile });
        }
        catch (err) {
            console.error("getProfile error:", err);
            cb({ status: "error", message: err.message });
        }
    });
    /** 🔹 Get profile by userId (any user) */
    socket.on("getProfileById", async ({ userId }, cb) => {
        try {
            if (!userId)
                return cb({ status: "error", message: "userId is required" });
            const profile = await prisma_1.prisma.profile.findUnique({
                where: { userId },
                include: { user: true },
            });
            if (!profile)
                return cb({ status: "error", message: "Profile not found" });
            cb({ status: "ok", profile });
        }
        catch (err) {
            console.error("getProfileById error:", err);
            cb({ status: "error", message: "Something went wrong" });
        }
    });
    /** 🔹 Save/update profile */
    socket.on("saveProfile", async (payload, cb) => {
        try {
            const userId = requireAuth(socket);
            const { headline, about, location, website, skills, avatarBase64 } = payload || {};
            let avatarUrl;
            if (avatarBase64)
                avatarUrl = await (0, cloudinary_1.uploadBase64Raw)(avatarBase64, "profile-avatars");
            const profile = await prisma_1.prisma.profile.upsert({
                where: { userId },
                create: {
                    userId,
                    headline,
                    about,
                    location,
                    website,
                    avatar: avatarUrl || null,
                    skills: Array.isArray(skills) ? skills : [],
                },
                update: {
                    headline,
                    about,
                    location,
                    website,
                    avatar: avatarUrl || undefined,
                    skills: Array.isArray(skills) ? skills : undefined,
                },
            });
            io.to(`user:${userId}`).emit("profile:updated", { profile });
            cb({ status: "ok", profile });
        }
        catch (err) {
            console.error("saveProfile error:", err);
            cb({ status: "error", message: err.message });
        }
    });
    /** 🔹 Education CRUD */
    socket.on("addEducation", async (payload, cb) => {
        try {
            const userId = requireAuth(socket);
            const profile = await prisma_1.prisma.profile.findUnique({ where: { userId } });
            if (!profile)
                throw new Error("Profile not found");
            const newItem = { id: (0, uuid_1.v4)(), ...payload };
            const updated = await prisma_1.prisma.profile.update({
                where: { userId },
                data: { education: [...profile.education, newItem] },
            });
            cb({ status: "ok", education: updated.education });
        }
        catch (err) {
            cb({ status: "error", message: err.message });
        }
    });
    socket.on("updateEducation", async ({ id, changes }, cb) => {
        try {
            const userId = requireAuth(socket);
            const profile = await prisma_1.prisma.profile.findUnique({ where: { userId } });
            if (!profile)
                throw new Error("Profile not found");
            const updatedEdu = profile.education.map((e) => e.id === id ? { ...e, ...changes } : e);
            const updated = await prisma_1.prisma.profile.update({ where: { userId }, data: { education: updatedEdu } });
            cb({ status: "ok", education: updated.education });
        }
        catch (err) {
            cb({ status: "error", message: err.message });
        }
    });
    socket.on("removeEducation", async ({ id }, cb) => {
        try {
            const userId = requireAuth(socket);
            const profile = await prisma_1.prisma.profile.findUnique({ where: { userId } });
            if (!profile)
                throw new Error("Profile not found");
            const updatedEdu = profile.education.filter((e) => e.id !== id);
            const updated = await prisma_1.prisma.profile.update({ where: { userId }, data: { education: updatedEdu } });
            cb({ status: "ok", education: updated.education });
        }
        catch (err) {
            cb({ status: "error", message: err.message });
        }
    });
    /** 🔹 Experience CRUD (same as Education) */
    socket.on("addExperience", async (payload, cb) => {
        try {
            const userId = requireAuth(socket);
            const profile = await prisma_1.prisma.profile.findUnique({ where: { userId } });
            if (!profile)
                throw new Error("Profile not found");
            const newItem = { id: (0, uuid_1.v4)(), ...payload };
            const updated = await prisma_1.prisma.profile.update({
                where: { userId },
                data: { experience: [...profile.experience, newItem] },
            });
            cb({ status: "ok", experience: updated.experience });
        }
        catch (err) {
            cb({ status: "error", message: err.message });
        }
    });
    socket.on("updateExperience", async ({ id, changes }, cb) => {
        try {
            const userId = requireAuth(socket);
            const profile = await prisma_1.prisma.profile.findUnique({ where: { userId } });
            if (!profile)
                throw new Error("Profile not found");
            const updatedExp = profile.experience.map((e) => e.id === id ? { ...e, ...changes } : e);
            const updated = await prisma_1.prisma.profile.update({ where: { userId }, data: { experience: updatedExp } });
            cb({ status: "ok", experience: updated.experience });
        }
        catch (err) {
            cb({ status: "error", message: err.message });
        }
    });
    socket.on("removeExperience", async ({ id }, cb) => {
        try {
            const userId = requireAuth(socket);
            const profile = await prisma_1.prisma.profile.findUnique({ where: { userId } });
            if (!profile)
                throw new Error("Profile not found");
            const updatedExp = profile.experience.filter((e) => e.id !== id);
            const updated = await prisma_1.prisma.profile.update({ where: { userId }, data: { experience: updatedExp } });
            cb({ status: "ok", experience: updated.experience });
        }
        catch (err) {
            cb({ status: "error", message: err.message });
        }
    });
}
//# sourceMappingURL=profileHandler.js.map