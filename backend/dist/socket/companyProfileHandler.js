"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCompanyProfileHandlers = registerCompanyProfileHandlers;
const prisma_1 = require("../prisma");
const cloudinary_1 = require("../utils/cloudinary");
function requireAuth(socket) {
    const userId = socket.data?.userId;
    if (!userId)
        throw new Error("Unauthenticated");
    return userId;
}
function registerCompanyProfileHandlers(io, socket) {
    /** 🔹 Get company profile */
    socket.on("getCompanyProfile", async (payload, cb) => {
        try {
            const targetUserId = payload?.userId || socket.data?.userId;
            if (!targetUserId)
                return cb({ status: "error", message: "No userId provided" });
            const profile = await prisma_1.prisma.companyProfile.findUnique({
                where: { userId: targetUserId },
                include: { user: true },
            });
            if (!profile)
                return cb({ status: "error", message: "Company profile not found" });
            cb({ status: "ok", profile });
        }
        catch (err) {
            console.error("getCompanyProfile error:", err);
            cb({ status: "error", message: err.message });
        }
    });
    /** 🔹 Save or update company profile */
    socket.on("saveCompanyProfile", async (payload, cb) => {
        try {
            const userId = requireAuth(socket);
            const { companyName, description, location, website, industry, employees, foundedYear, logoBase64, } = payload;
            console.log("saveCompanyProfile payload:", payload);
            let logoUrl;
            if (logoBase64)
                logoUrl = await (0, cloudinary_1.uploadBase64Raw)(logoBase64, "company-logos");
            const profile = await prisma_1.prisma.companyProfile.upsert({
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
        }
        catch (err) {
            console.error("saveCompanyProfile error:", err);
            cb({ status: "error", message: err.message });
        }
    });
}
//# sourceMappingURL=companyProfileHandler.js.map