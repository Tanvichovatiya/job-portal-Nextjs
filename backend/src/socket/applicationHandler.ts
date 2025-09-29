
// src/server/socket/applicationHandlers.ts
import { Server, Socket } from "socket.io";
import { uploadBase64Raw } from "../utils/cloudinary";
import { prisma } from "../prisma";

export function registerApplicationHandlers(io: Server, socket: Socket) {
  // Get applicants for current employer
  socket.on("getApplicants", async (cb: (res: any) => void) => {
    try {
      const userId = (socket as any).data.userId;
      if (!userId) return cb({ status: "error", message: "Unauthorized" });

      // Find applications for jobs where job.employerId == userId
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
        resume: a.resume,
      }));

      cb({ status: "ok", applicants: mapped });
    } catch (err: any) {
      cb({ status: "error", message: err.message });
    }
  });

  // Candidate applies (sends resume as base64 string)
  socket.on("applyToJob", async ({ jobId, userId, resumeBase64 }, cb: (res: any) => void) => {
    try {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) return cb({ status: "error", message: "Job not found" });

      let resumeUrl: string | null = null;
      if (resumeBase64) {
        // resumeBase64 should be raw base64 (no data: prefix)
        resumeUrl = await uploadBase64Raw(resumeBase64, `resumes/${jobId}`);
      }

      const application = await prisma.application.create({
        data: {
          jobId,
          userId,
          resume: resumeUrl,
        },
        include: { user: true, job: true },
      });

      // Notify employer's room
      io.to(`user:${job.employerId}`).emit("employer:updateApplicants", {
        application: {
          id: application.id,
          name: application.user.name,
          role: application.job.title,
          status: application.status,
          date: application.createdAt,
          resume: application.resume,
        },
        activity: {
          text: `New application: ${application.user.name} → ${application.job.title}`,
          time: new Date().toISOString(),
        },
      });

      cb({ status: "ok", applicationId: application.id });
    } catch (err: any) {
      console.error("applyToJob error", err);
      cb({ status: "error", message: err.message });
    }
  });

  // Employer updates status (accept/reject)
  socket.on("updateApplicationStatus", async ({ applicationId, status }, cb: (res: any) => void) => {
    try {
      const userId = (socket as any).data.userId;
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { job: true, user: true },
      });

      if (!application) return cb({ status: "error", message: "Application not found" });
      if (application.job.employerId !== userId) return cb({ status: "error", message: "Not authorized" });

      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: { status },
      });

      // Emit updated application to employer room (so UI refreshes)
      io.to(`user:${userId}`).emit("employer:updateApplicants", {
        application: {
          id: updated.id,
          name: application.user.name,
          role: application.job.title,
          status: updated.status,
          date: updated.createdAt,
          resume: updated.resume,
        },
        activity: {
          text: `${status === "accepted" ? "Accepted" : "Rejected"}: ${application.user.name} → ${application.job.title}`,
          time: new Date().toISOString(),
        },
      });

      // Notify candidate as well
      io.to(`user:${application.userId}`).emit("application:statusUpdated", {
        applicationId: updated.id,
        status: updated.status,
      });

      cb({ status: "ok" });
    } catch (err: any) {
      cb({ status: "error", message: err.message });
    }
  });
}
