// src/server/socket/applicationHandlers.ts
import { Server, Socket } from "socket.io";
import { uploadBase64Raw } from "../utils/cloudinary";
import { prisma } from "../prisma";

export function registerApplicationHandlers(io: Server, socket: Socket) {
  // ✅ Get all applicants for an employer
  socket.on("getApplicants", async (cb: (res: any) => void) => {
    try {
      const userId = (socket as any).data.userId;
      if (!userId) return cb({ status: "error", message: "Unauthorized" });

      const applications = await prisma.application.findMany({
        where: { job: { employerId: userId } as any },
        include: { user: true, job: true },
        orderBy: { createdAt: "desc" } as any,
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
    } catch (err: any) {
      cb({ status: "error", message: err.message });
    }
  });

  // ✅ Candidate applies to a job
 // ✅ Candidate applies to a job
socket.on(
  "applyToJob",
  async ({ jobId, userId, resumeBase64 }, cb: (res: any) => void) => {
    try {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) return cb({ status: "error", message: "Job not found" });

      // ✅ Check if user already applied
      const existing = await prisma.application.findFirst({
        where: { jobId, userId },
      });
      if (existing)
        return cb({
          status: "error",
          message: "You have already applied for this job.",
        });

      let resumeUrl: string | null = null;
      if (resumeBase64) {
        resumeUrl = await uploadBase64Raw(resumeBase64, `resumes/${jobId}`);
      }

      const application = await prisma.application.create({
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
    } catch (err: any) {
      console.error("applyToJob error", err);
      cb({ status: "error", message: err.message });
    }
  }
);

// ✅ Check if user already applied for a job
socket.on("getApplicantsForUser", async ({ jobId, userId }, cb) => {
  try {
    const existing = await prisma.application.findFirst({
      where: { jobId, userId },
    });
    cb({ status: "ok", applied: !!existing });
  } catch (err: any) {
    cb({ status: "error", message: err.message });
  }
});


  // ✅ Employer updates application status
  socket.on("updateApplicationStatus", async ({ applicationId, status }, cb: (res: any) => void) => {
    try {
      const userId = (socket as any).data.userId;

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { job: true, user: true },
      });

      if (!application) return cb({ status: "error", message: "Application not found" });
      if (application.job.employerId !== userId)
        return cb({ status: "error", message: "Not authorized" });

      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: { status },
      });

      await prisma.notification.create({
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
    } catch (err: any) {
      cb({ status: "error", message: err.message });
    }
  });
}
