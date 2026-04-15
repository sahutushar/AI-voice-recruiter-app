import { redirect } from "next/navigation";
import { db } from "@/db";
import { jobInvites, jobs, recruiterSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import InterviewSession from "@/components/interview/session/InterviewSession";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { level: string }> = {
  SCR: { level: "Screening" },
  TEC: { level: "Technical" },
  HRF: { level: "HR Final" },
};

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ interviewId: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { interviewId } = await params;
  const { name } = await searchParams;

  if (!name) redirect(`/interview/${interviewId}`);

  // Strategy 1: look up by exact interviewLink
  const [invite] = await db
    .select()
    .from(jobInvites)
    .where(eq(jobInvites.interviewLink, interviewId));

  let job = invite
    ? (await db.select().from(jobs).where(eq(jobs.id, invite.jobId)))[0]
    : null;

  // Strategy 2: parse jobId from link format PREFIX-JOBID-TS-RAND
  if (!job) {
    const parts = interviewId.split("-");
    if (parts.length >= 2) {
      const jobId = parseInt(parts[1]);
      if (!isNaN(jobId)) {
        const found = await db.select().from(jobs).where(eq(jobs.id, jobId));
        job = found[0] ?? null;
      }
    }
  }

  const [settings] = await db.select().from(recruiterSettings).limit(1);
  const companyName = settings?.companyName ?? "RecruiterAI";

  const prefix = interviewId.split("-")[0];
  const level = TYPE_META[prefix]?.level ?? "Interview";

  return (
    <InterviewSession
      interviewId={interviewId}
      candidateName={decodeURIComponent(name)}
      role={job?.title ?? "Open Position"}
      level={level}
      techstack={job?.skills ?? ""}
      company={companyName}
    />
  );
}
