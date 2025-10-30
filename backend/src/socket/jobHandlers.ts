import { Server, Socket } from "socket.io";
import { prisma } from "../prisma";

export function registerJobHandlers(io: Server, socket: Socket) {
  // CREATE JOB
  socket.on("createJob", async (data, cb) => {
    try {
      const userId = (socket as any).data.userId;
      if (!userId) return cb({ status: "error", message: "Not authenticated" });

      if (!data.title || !data.description || !data.companyname) {
        return cb({ status: "error", message: "All required fields missing" });
      }

      const job = await prisma.job.create({
        data: {
          title: data.title,
          description: data.description,
          companyName: data.companyname,
          salary: data.salary ?? null,
          category: data.category ?? null,
          location: data.location ?? null,
          jobType: data.jobType ?? "FULL_TIME",
          employerId: userId,
        },
      });

      io.emit("job:created", job);
      cb({ status: "ok", job });
    } catch (err: any) {
      console.error("Create Job Error:", err);
      cb({ status: "error", message: err.message });
    }
  });

  // UPDATE JOB
  socket.on("updateJob", async ({ jobId, data }, cb) => {
    try {
      const job = await prisma.job.update({
        where: { id: jobId },
        data: {
          title: data.title,
          description: data.description,
          companyName: data.companyname,
          salary: data.salary ?? null,
          location: data.location ?? null,
          category: data.category ?? null,
          jobType: data.jobType ?? "FULL_TIME",
        },
      });
      io.emit("job:updated", job);
      cb({ status: "ok", job });
    } catch (err: any) {
      console.error("Update Job Error:", err);
      cb({ status: "error", message: err.message });
    }
  });

  // DELETE JOB
  socket.on("deleteJob", async ({ jobId }, cb) => {
    try {
      await prisma.job.delete({ where: { id: jobId } });
      io.emit("job:deleted", { jobId });
      cb({ status: "ok" });
    } catch (err: any) {
      console.error("Delete Job Error:", err);
      cb({ status: "error", message: err.message });
    }
  });

  // GET COMPANY JOBS
  // backend getMyJobs

// GET COMPANY JOBS
socket.on("getMyJobs", async (_payload, cb) => {
  try {
    const userId = (socket as any).data.userId;
    const role = (socket as any).data.role;
    console.log("User ID:", userId, "Role:", role);
    if (!userId || role !== "company")
      return cb({ status: "error", message: "Not authorized" });

    // Fetch only jobs created by logged-in company
    const jobs = await prisma.job.findMany({
      where: { employerId: userId },
      orderBy: { createdAt: "desc" },
    });

    cb({ status: "ok", jobs });
  } catch (err) {
    console.error("getMyJobs error", err);
    cb({ status: "error", message: "Could not fetch jobs" });
  }
});

 socket.on("getJobs", async (payload: any, cb: (res: any) => void) => {
  try {
    const { search, location, category, jobType } = payload || {};

    // Build dynamic filter object
    const filters: any = {};

    // Search in title, companyName, or location
    if (search && search.trim() !== "") {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    // Location filter
    if (location && location.trim() !== "") {
      filters.location = { contains: location, mode: "insensitive" };
    }

    // Category filter
    if (category && category.trim() !== "") {
      filters.category = { equals: category };
    }

    // Job Type filter
    if (jobType && jobType.trim() !== "") {
      // Convert frontend JobType string to enum if needed
      const enumMap: Record<string, string> = {
        "Full-time": "FULL_TIME",
        "Part-time": "PART_TIME",
        "Remote": "REMOTE",
        "Contract": "CONTRACT",
        "Internship": "INTERNSHIP",
      };
      filters.jobType = enumMap[jobType] || jobType;
    }

    // Fetch jobs with filters
    const jobs = await prisma.job.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });

    cb({ status: "ok", jobs });
  } catch (err: any) {
    console.error("getJobs error:", err);
    cb({ status: "error", message: err.message || "Could not fetch jobs" });
  }
});

// get job By id

// GET SINGLE JOB
socket.on("getJobById", async (jobId: string, cb) => {
  try {
    if (!jobId) return cb({ status: "error", message: "Job ID required" });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) return cb({ status: "error", message: "Job not found" });

    cb({ status: "ok", job });
  } catch (err: any) {
    console.error("getJobById error:", err);
    cb({ status: "error", message: err.message || "Could not fetch job" });
  }
});


}