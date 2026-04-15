import { db } from "@/db";
import { jobs, jobInvites, candidates, interviewSessions, interviewSummaries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import InterviewsClient from "@/components/dashboard/interviews/InterviewsClient";

export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  const [allJobs, allInvites, allCandidates, allSessions, allSummaries] = await Promise.all([
    db.select().from(jobs).orderBy(desc(jobs.createdAt)),
    db.select().from(jobInvites),
    db.select().from(candidates),
    db.select().from(interviewSessions).orderBy(desc(interviewSessions.createdAt)),
    db.select().from(interviewSummaries),
  ]);

  const summaryMap = new Map(allSummaries.map((s) => [s.sessionId, s]));
  const candidateMap = new Map(allCandidates.map((c) => [c.id, c]));

  // Build enriched invites: attach candidate info + interview result if exists
  const enrichedInvites = allInvites.map((inv) => {
    const candidate = candidateMap.get(inv.candidateId);
    const session = allSessions.find(
      (s) => s.interviewId === inv.interviewLink ||
        (candidate && s.candidateName.toLowerCase() === candidate.name.toLowerCase())
    );
    const summary = session ? summaryMap.get(session.id) : undefined;

    return {
      id: inv.id,
      jobId: inv.jobId,
      candidateId: inv.candidateId,
      status: inv.status,
      interviewLink: inv.interviewLink ?? "",
      createdAt: inv.createdAt.toISOString(),
      candidate: candidate ? { id: candidate.id, name: candidate.name, email: candidate.email, roleApplied: candidate.roleApplied, experience: candidate.experience ?? "", skills: candidate.skills ?? "" } : null,
      session: session ? { id: session.id, status: session.status, createdAt: session.createdAt.toISOString() } : null,
      summary: summary ? { overallScore: summary.overallScore, technicalScore: summary.technicalScore, communicationScore: summary.communicationScore, recommendation: summary.recommendation } : null,
    };
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      <InterviewsClient
        jobs={allJobs.map((j) => ({
          id: j.id,
          title: j.title,
          department: j.department ?? "",
          location: j.location ?? "",
          type: j.type ?? "full-time",
          experience: j.experience ?? "",
          status: j.status,
          skills: j.skills ?? "",
          createdAt: j.createdAt.toISOString(),
        }))}
        invites={enrichedInvites}
      />
    </div>
  );
}
