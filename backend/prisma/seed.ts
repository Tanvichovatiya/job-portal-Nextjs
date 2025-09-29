
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const company = await prisma.user.create({
    data: {
      name: "Tech Corp",
      email: "company@example.com",
      password: "hashedpassword",
      role: "company",
    },
  });

  const candidate = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: "hashedpassword",
      role: "user",
    },
  });

  const job = await prisma.job.create({
    data: {
      title: "Frontend Engineer",
      description: "Build modern UI.",
      salary: 50000,
      jobType: "FULL_TIME",
      employerId: company.id,
      companyName: "Tech Corp",
    },
  });

  // Optional example application
  await prisma.application.create({
    data: {
      jobId: job.id,
      userId: candidate.id,
      resume: "https://res.cloudinary.com/demo/sample.pdf",
    },
  });

  console.log("Seed completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
