import { db } from "@/db";
import { jobs } from "@/db/schema";
import { desc } from "drizzle-orm";
import JobsClient from "@/components/dashboard/jobs/JobsClient";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));

  const stats = {
    total:   allJobs.length,
    active:  allJobs.filter((j) => j.status === "active").length,
    draft:   allJobs.filter((j) => j.status === "draft").length,
    expired: allJobs.filter((j) => j.status === "expired").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <JobsClient
        stats={stats}
        jobs={allJobs.map((j) => ({
          id: j.id,
          title: j.title,
          department: j.department ?? "",
          location: j.location ?? "",
          type: j.type ?? "full-time",
          experience: j.experience ?? "",
          salary: j.salary ?? "",
          description: j.description ?? "",
          requirements: j.requirements ?? "",
          skills: j.skills ?? "",
          status: j.status,
          createdAt: j.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
