import { db } from "@/db";
import { candidates, interviewSessions, interviewSummaries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import CandidatesClient from "@/components/dashboard/candidates/CandidatesClient";

export default async function CandidatesPage() {
  // Fetch recruiter-added candidates
  const allCandidates = await db
    .select()
    .from(candidates)
    .orderBy(desc(candidates.createdAt));

  // Fetch interview sessions with summaries joined
  const sessions = await db.select().from(interviewSessions).orderBy(desc(interviewSessions.createdAt));
  const summaries = await db.select().from(interviewSummaries);
  const summaryMap = new Map(summaries.map((s) => [s.sessionId, s]));

  const sessionsWithScores = sessions.map((s) => {
    const summary = summaryMap.get(s.id);
    return {
      id: s.id,
      candidateName: s.candidateName,
      role: s.role,
      level: s.level,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      overallScore: summary?.overallScore,
      recommendation: summary?.recommendation,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <CandidatesClient
        candidates={allCandidates.map((c) => ({
          ...c,
          phone: c.phone ?? "",
          experience: c.experience ?? "",
          skills: c.skills ?? "",
          createdAt: c.createdAt.toISOString(),
        }))}
        sessions={sessionsWithScores}
      />
    </div>
  );
}
