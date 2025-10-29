"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerApplicationHandlers = registerApplicationHandlers;
const cloudinary_1 = require("../utils/cloudinary");
const prisma_1 = require("../prisma");
function registerApplicationHandlers(io, socket) {
    // ✅ Get all applicants for an employer
    socket.on("getApplicants", async (cb) => {
        try {
            const userId = socket.data.userId;
            if (!userId)
                return cb({ status: "error", message: "Unauthorized" });
            const applications = await prisma_1.prisma.application.findMany({
                where: { job: { employerId: userId } },
                include: { user: true, job: true },
                orderBy: { createdAt: "desc" },
            });
            const mapped = applications.map((a) => ({
                id: a.id,
                name: a.user.name,
                role: a.job.title,
                status: a.status,
                date: a.createdAt,
                resume: a.resume || null, // ✅ ensure valid
            }));
            cb({ status: "ok", applicants: mapped });
        }
        catch (err) {
            cb({ status: "error", message: err.message });
        }
    });
    // ✅ Candidate applies to a job
    // ✅ Candidate applies to a job
    socket.on("applyToJob", async ({ jobId, userId, resumeBase64 }, cb) => {
        try {
            const job = await prisma_1.prisma.job.findUnique({ where: { id: jobId } });
            if (!job)
                return cb({ status: "error", message: "Job not found" });
            // ✅ Check if user already applied
            const existing = await prisma_1.prisma.application.findFirst({
                where: { jobId, userId },
            });
            if (existing)
                return cb({
                    status: "error",
                    message: "You have already applied for this job.",
                });
            let resumeUrl = null;
            if (resumeBase64) {
                resumeUrl = await (0, cloudinary_1.uploadBase64Raw)(resumeBase64, `resumes/${jobId}`);
            }
            const application = await prisma_1.prisma.application.create({
                data: { jobId, userId, resume: resumeUrl },
                include: { user: true, job: true },
            });
            // 🔔 Notify employer in real-time
            io.to(`user:${job.employerId}`).emit("employer:updateApplicants", {
                application: {
                    id: application.id,
                    name: application.user.name,
                    role: application.job.title,
                    status: application.status,
                    date: application.createdAt,
                    resume: application.resume,
                },
            });
            cb({ status: "ok", applicationId: application.id });
        }
        catch (err) {
            console.error("applyToJob error", err);
            cb({ status: "error", message: err.message });
        }
    });
    // ✅ Check if user already applied for a job
    socket.on("getApplicantsForUser", async ({ jobId, userId }, cb) => {
        try {
            const existing = await prisma_1.prisma.application.findFirst({
                where: { jobId, userId },
            });
            cb({ status: "ok", applied: !!existing });
        }
        catch (err) {
            cb({ status: "error", message: err.message });
        }
    });
    // ✅ Employer updates application status
    socket.on("updateApplicationStatus", async ({ applicationId, status }, cb) => {
        try {
            const userId = socket.data.userId;
            const application = await prisma_1.prisma.application.findUnique({
                where: { id: applicationId },
                include: { job: true, user: true },
            });
            if (!application)
                return cb({ status: "error", message: "Application not found" });
            if (application.job.employerId !== userId)
                return cb({ status: "error", message: "Not authorized" });
            const updated = await prisma_1.prisma.application.update({
                where: { id: applicationId },
                data: { status },
            });
            await prisma_1.prisma.notification.create({
                data: {
                    userId: application.userId,
                    message: `Your application for "${application.job.title}" was ${status}.`,
                },
            });
            io.to(`user:${userId}`).emit("employer:updateApplicants", {
                application: {
                    id: updated.id,
                    name: application.user.name,
                    role: application.job.title,
                    status: updated.status,
                    date: updated.createdAt,
                    resume: updated.resume,
                },
            });
            io.to(`user:${application.userId}`).emit("application:statusUpdated", {
                applicationId: updated.id,
                status: updated.status,
                jobTitle: application.job.title,
            });
            cb({ status: "ok" });
        }
        catch (err) {
            cb({ status: "error", message: err.message });
        }
    });
}
//# sourceMappingURL=applicationHandler.js.map