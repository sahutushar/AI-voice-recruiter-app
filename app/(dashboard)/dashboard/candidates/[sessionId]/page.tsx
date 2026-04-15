import { db } from "@/db";
import { interviewSessions, interviewSummaries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ChartAverageIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  StarIcon,
  AiPhone01Icon,
  UserIcon,
  BriefcaseIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-bold text-foreground">{score}/100</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const id = parseInt(sessionId);
  if (isNaN(id)) notFound();

  const [session] = await db.select().from(interviewSessions).where(eq(interviewSessions.id, id));
  if (!session) notFound();

  const [summary] = await db.select().from(interviewSummaries).where(eq(interviewSummaries.sessionId, id));

  const transcript: { role: string; text: string }[] = JSON.parse(session.transcript);
  const strengths: string[] = summary ? JSON.parse(summary.strengths) : [];
  const weaknesses: string[] = summary ? JSON.parse(summary.weaknesses) : [];

  const recConfig = {
    hire:  { label: "Recommended to Hire",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    maybe: { label: "Consider Further",      cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    no:    { label: "Not Recommended",       cls: "bg-red-500/15 text-red-400 border-red-500/30" },
  }[summary?.recommendation ?? "maybe"] ?? { label: "Pending", cls: "bg-muted text-muted-foreground border-border" };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Back */}
      <Link href="/dashboard/candidates" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
        Back to Candidates
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center text-violet-400 font-bold text-xl sm:text-2xl shrink-0">
          {session.candidateName[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{session.candidateName}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{session.level} {session.role} · {session.company}</p>
            </div>
            {summary && (
              <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${recConfig.cls}`}>
                {recConfig.label}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
            {[
              { icon: BriefcaseIcon, text: session.techstack },
              { icon: Calendar03Icon, text: new Date(session.createdAt).toLocaleDateString("en-US", { dateStyle: "long" }) },
              { icon: ChartAverageIcon, text: `Status: ${session.status}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <HugeiconsIcon icon={item.icon} size={13} strokeWidth={2} />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scores + Analysis */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {summary ? (
            <>
              {/* Score card */}
              <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-foreground">Performance Scores</h2>
                <ScoreBar label="Overall" score={summary.overallScore} color="bg-gradient-to-r from-violet-500 to-blue-500" />
                <ScoreBar label="Technical" score={summary.technicalScore} color="bg-violet-500" />
                <ScoreBar label="Communication" score={summary.communicationScore} color="bg-blue-500" />
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold text-foreground mb-3">AI Summary</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{summary.summary}</p>
              </div>

              {/* Strengths */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <HugeiconsIcon icon={ThumbsUpIcon} size={15} className="text-emerald-400" strokeWidth={2} />
                  <h2 className="text-sm font-semibold text-foreground">Strengths</h2>
                </div>
                <ul className="flex flex-col gap-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <HugeiconsIcon icon={StarIcon} size={13} className="text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <HugeiconsIcon icon={ThumbsDownIcon} size={15} className="text-amber-400" strokeWidth={2} />
                  <h2 className="text-sm font-semibold text-foreground">Areas to Improve</h2>
                </div>
                <ul className="flex flex-col gap-2">
                  {weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-amber-400 shrink-0 mt-1 text-[10px]">●</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground text-sm">Analysis pending...</p>
            </div>
          )}
        </div>

        {/* Right: Full Transcript */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-border shrink-0">
            <h2 className="text-sm font-semibold text-foreground">Full Interview Transcript</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{transcript.length} messages</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col gap-4 max-h-[400px] sm:max-h-[600px]">
            {transcript.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "ai" ? "bg-gradient-to-br from-violet-500 to-blue-600" : "bg-muted"}`}>
                  <HugeiconsIcon
                    icon={msg.role === "ai" ? AiPhone01Icon : UserIcon}
                    size={15} color="white" strokeWidth={2}
                  />
                </div>
                <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {msg.role === "ai" ? "RecruiterAI" : session.candidateName}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "ai"
                      ? "bg-violet-500/10 border border-violet-500/20 text-foreground rounded-tl-sm"
                      : "bg-muted border border-border text-foreground rounded-tr-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
