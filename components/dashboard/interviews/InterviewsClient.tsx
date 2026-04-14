"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon, UserGroupIcon, CheckmarkCircle01Icon, Clock01Icon,
  ChartAverageIcon, Calendar03Icon, ArrowRight01Icon, SortByDown01Icon,
  AiPhone01Icon, UserIcon, ThumbsUpIcon, ThumbsDownIcon, Cancel01Icon,
  BriefcaseIcon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Job {
  id: number; title: string; department: string; location: string;
  type: string; experience: string; status: string; skills: string; createdAt: string;
}
interface Invite {
  id: number; jobId: number; candidateId: number; status: string;
  interviewLink: string; createdAt: string;
  candidate: { id: number; name: string; email: string; roleApplied: string; experience: string; skills: string } | null;
  session: { id: number; status: string; createdAt: string } | null;
  summary: { overallScore: number; technicalScore: number; communicationScore: number; recommendation: string } | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const REC = {
  hire:  { label: "Hire",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  maybe: { label: "Maybe", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  no:    { label: "No",    cls: "bg-red-500/15 text-red-400 border-red-500/20" },
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{score}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ── Detail drawer ──────────────────────────────────────────────────────────────
function ResultDrawer({ invite, onClose }: { invite: Invite; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "transcript">("overview");
  const rec = invite.summary ? (REC[invite.summary.recommendation as keyof typeof REC] ?? REC.maybe) : null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full sm:max-w-2xl bg-card border-l border-border flex flex-col h-full shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 font-bold text-base shrink-0">
              {invite.candidate?.name[0].toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-bold text-foreground">{invite.candidate?.name ?? "Unknown"}</p>
              <p className="text-xs text-muted-foreground">{invite.candidate?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {rec && <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${rec.cls}`}>{rec.label}</span>}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {(["overview", "transcript"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${tab === t ? "text-violet-400 border-b-2 border-violet-500" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "overview" ? "Scores & Highlights" : "Full Transcript"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "overview" ? (
            <div className="flex flex-col gap-5">
              {invite.summary ? (
                <>
                  {/* Score cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Overall",       score: invite.summary.overallScore,       color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/20" },
                      { label: "Technical",     score: invite.summary.technicalScore,     color: "text-blue-400",   bg: "bg-blue-500/15",   border: "border-blue-500/20" },
                      { label: "Communication", score: invite.summary.communicationScore, color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/20" },
                    ].map(s => (
                      <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4 text-center`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.score}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Score bars */}
                  <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-3">
                    <ScoreBar label="Overall Score"       score={invite.summary.overallScore}       color="bg-gradient-to-r from-violet-500 to-blue-500" />
                    <ScoreBar label="Technical Score"     score={invite.summary.technicalScore}     color="bg-violet-500" />
                    <ScoreBar label="Communication Score" score={invite.summary.communicationScore} color="bg-blue-500" />
                  </div>

                  {/* Key highlights */}
                  <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                    <p className="text-sm font-semibold text-foreground">Key Highlights</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <HugeiconsIcon icon={ThumbsUpIcon} size={13} className="text-emerald-400" strokeWidth={2} />
                          <span className="text-xs font-semibold text-emerald-400">Strengths</span>
                        </div>
                        <ul className="flex flex-col gap-1.5">
                          {[
                            invite.summary.technicalScore >= 70 && "Strong technical knowledge",
                            invite.summary.communicationScore >= 70 && "Clear communication",
                            invite.summary.overallScore >= 80 && "Excellent overall performance",
                            invite.summary.technicalScore >= 80 && "Deep technical expertise",
                          ].filter(Boolean).slice(0, 3).map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>{s}
                            </li>
                          ))}
                          {invite.summary.overallScore < 70 && invite.summary.technicalScore < 70 && invite.summary.communicationScore < 70 && (
                            <li className="text-xs text-muted-foreground">Needs improvement across areas</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <HugeiconsIcon icon={ThumbsDownIcon} size={13} className="text-amber-400" strokeWidth={2} />
                          <span className="text-xs font-semibold text-amber-400">Areas to Improve</span>
                        </div>
                        <ul className="flex flex-col gap-1.5">
                          {[
                            invite.summary.technicalScore < 70 && "Technical depth",
                            invite.summary.communicationScore < 70 && "Communication clarity",
                            invite.summary.overallScore < 60 && "Overall performance",
                          ].filter(Boolean).slice(0, 3).map((w, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <span className="text-amber-400 shrink-0 mt-0.5">●</span>{w}
                            </li>
                          ))}
                          {invite.summary.technicalScore >= 70 && invite.summary.communicationScore >= 70 && (
                            <li className="text-xs text-muted-foreground">No major areas of concern</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className={`rounded-xl border p-4 ${rec?.cls ?? ""}`}>
                    <p className="text-sm font-bold">Recommendation: {rec?.label}</p>
                    <p className="text-xs mt-1 opacity-80">
                      {invite.summary.recommendation === "hire" && "This candidate is a strong fit. Recommend proceeding to the next stage."}
                      {invite.summary.recommendation === "maybe" && "This candidate shows potential. Consider a follow-up interview."}
                      {invite.summary.recommendation === "no" && "This candidate did not meet the required criteria for this role."}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <HugeiconsIcon icon={Clock01Icon} size={32} className="text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                  <p className="font-semibold text-foreground">Interview Pending</p>
                  <p className="text-sm text-muted-foreground mt-1">Results will appear once the candidate completes the interview.</p>
                </div>
              )}
            </div>
          ) : (
            // Transcript tab — links to full detail page
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <HugeiconsIcon icon={AiPhone01Icon} size={36} className="text-violet-400" strokeWidth={1.5} />
              <div>
                <p className="font-semibold text-foreground">Full Transcript Available</p>
                <p className="text-sm text-muted-foreground mt-1">View the complete interview conversation and detailed AI analysis.</p>
              </div>
              {invite.session && (
                <a href={`/dashboard/candidates/${invite.session.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors">
                  View Full Report <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={2.5} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function InterviewsClient({ jobs, invites }: { jobs: Job[]; invites: Invite[] }) {
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [search, setSearch]             = useState("");
  const [sort, setSort]                 = useState<"name" | "score" | "date">("date");
  const [filter, setFilter]             = useState<"all" | "pending" | "completed">("all");
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);

  // Unique roles from jobs
  const roles = useMemo(() => {
    const unique = Array.from(new Set(jobs.map(j => j.title)));
    return ["all", ...unique];
  }, [jobs]);

  // Job id → title map
  const jobMap = useMemo(() => new Map(jobs.map(j => [j.id, j])), [jobs]);

  // Filter + sort invites
  const filtered = useMemo(() => {
    let list = [...invites];

    // Role filter
    if (selectedRole !== "all") {
      const jobIds = jobs.filter(j => j.title === selectedRole).map(j => j.id);
      list = list.filter(i => jobIds.includes(i.jobId));
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.candidate?.name.toLowerCase().includes(q) ||
        i.candidate?.email.toLowerCase().includes(q) ||
        jobMap.get(i.jobId)?.title.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filter === "pending")   list = list.filter(i => !i.session);
    if (filter === "completed") list = list.filter(i => !!i.session);

    // Sort
    if (sort === "name")  list.sort((a, b) => (a.candidate?.name ?? "").localeCompare(b.candidate?.name ?? ""));
    if (sort === "score") list.sort((a, b) => (b.summary?.overallScore ?? -1) - (a.summary?.overallScore ?? -1));
    if (sort === "date")  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list;
  }, [invites, selectedRole, search, filter, sort, jobs, jobMap]);

  // Stats
  const scopedInvites = selectedRole === "all" ? invites : invites.filter(i => {
    const jobIds = jobs.filter(j => j.title === selectedRole).map(j => j.id);
    return jobIds.includes(i.jobId);
  });
  const totalInvited   = scopedInvites.length;
  const totalCompleted = scopedInvites.filter(i => !!i.session).length;
  const withScore      = scopedInvites.filter(i => i.summary);
  const avgScore       = withScore.length > 0
    ? Math.round(withScore.reduce((acc, i) => acc + (i.summary?.overallScore ?? 0), 0) / withScore.length)
    : null;

  const invitedList   = filtered.filter(i => !i.session);
  const completedList = filtered.filter(i => !!i.session);

  return (
    <div className="flex flex-col gap-5 max-w-7xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interviews & Schedule</h1>
        <p className="text-muted-foreground text-sm mt-1">Track invited candidates and interview results.</p>
      </div>

      {/* Filters row */}
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">

        {/* Role dropdown */}
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={BriefcaseIcon} size={15} className="text-muted-foreground shrink-0" strokeWidth={2} />
          <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background text-sm px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500 w-full sm:min-w-40">
            {roles.map(r => (
              <option key={r} value={r}>{r === "all" ? "All Roles" : r}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0 sm:min-w-48">
          <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search candidates..." className="pl-8 h-9 text-sm" />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={SortByDown01Icon} size={15} className="text-muted-foreground" strokeWidth={2} />
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
            className="h-9 rounded-lg border border-border bg-background text-sm px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500">
            <option value="date">Sort: Date</option>
            <option value="name">Sort: Name</option>
            <option value="score">Sort: Score</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {(["all", "pending", "completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Reset */}
        <button onClick={() => { setSelectedRole("all"); setSearch(""); setSort("date"); setFilter("all"); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted">
          Reset
        </button>
      </div>

      {/* Stats boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: UserGroupIcon,        label: "Invited",   value: totalInvited,                          sub: "Total candidates invited",    color: "text-blue-400",    bg: "bg-blue-500/15",    border: "border-blue-500/20" },
          { icon: CheckmarkCircle01Icon, label: "Completed", value: totalCompleted,                        sub: `${totalInvited - totalCompleted} still pending`, color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/20" },
          { icon: ChartAverageIcon,      label: "Avg Score", value: avgScore !== null ? `${avgScore}%` : "—", sub: avgScore !== null ? `Based on ${withScore.length} results` : "No results yet", color: "text-violet-400",  bg: "bg-violet-500/15",  border: "border-violet-500/20" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${s.border} bg-card p-5 flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <HugeiconsIcon icon={s.icon} size={22} className={s.color} strokeWidth={2} />
            </div>
            <div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm font-semibold text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Invited candidates */}
        <div className="rounded-2xl border border-border bg-card flex flex-col">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Invited Candidates</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{invitedList.length} pending interview{invitedList.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <HugeiconsIcon icon={UserGroupIcon} size={16} className="text-blue-400" strokeWidth={2} />
            </div>
          </div>
          <div className="flex flex-col divide-y divide-border overflow-y-auto max-h-[520px]">
            {invitedList.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                  <HugeiconsIcon icon={UserGroupIcon} size={22} className="text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-foreground">No pending invites</p>
                <p className="text-xs text-muted-foreground">All candidates have completed their interviews.</p>
              </div>
            ) : invitedList.map(inv => (
              <div key={inv.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                  {inv.candidate?.name[0].toUpperCase() ?? "?"}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{inv.candidate?.name ?? "Unknown"}</p>
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Pending</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{inv.candidate?.email}</p>

                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <HugeiconsIcon icon={BriefcaseIcon} size={11} strokeWidth={2} />
                      {jobMap.get(inv.jobId)?.title ?? "—"}
                    </span>
                    {inv.candidate?.experience && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <HugeiconsIcon icon={ChartAverageIcon} size={11} strokeWidth={2} />
                        {inv.candidate.experience}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <HugeiconsIcon icon={Calendar03Icon} size={11} strokeWidth={2} />
                      Invited {new Date(inv.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  {inv.candidate?.skills && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {inv.candidate.skills.split(",").slice(0, 4).map(s => (
                        <span key={s} className="text-[10px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-md">{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interview link */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {inv.interviewLink && (
                    <a href={`/interview/${inv.interviewLink}`} target="_blank"
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors opacity-0 group-hover:opacity-100">
                      Open Link <HugeiconsIcon icon={ArrowRight01Icon} size={11} strokeWidth={2.5} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interview results */}
        <div className="rounded-2xl border border-border bg-card flex flex-col">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Interview Results</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{completedList.length} completed interview{completedList.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-emerald-400" strokeWidth={2} />
            </div>
          </div>
          <div className="flex flex-col divide-y divide-border overflow-y-auto max-h-[520px]">
            {completedList.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={22} className="text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-foreground">No results yet</p>
                <p className="text-xs text-muted-foreground">Completed interviews will appear here.</p>
              </div>
            ) : completedList.map(inv => {
              const rec = inv.summary ? (REC[inv.summary.recommendation as keyof typeof REC] ?? REC.maybe) : null;
              const score = inv.summary?.overallScore ?? null;
              const scoreColor = score !== null ? (score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400") : "text-muted-foreground";
              const scoreBg   = score !== null ? (score >= 70 ? "bg-emerald-500/10 border-emerald-500/20" : score >= 50 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20") : "bg-muted border-border";
              return (
                <button key={inv.id} onClick={() => setSelectedInvite(inv)}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors text-left w-full group">

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                    {inv.candidate?.name[0].toUpperCase() ?? "?"}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground">{inv.candidate?.name ?? "Unknown"}</p>
                      {rec && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rec.cls}`}>{rec.label}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{inv.candidate?.email}</p>

                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <HugeiconsIcon icon={BriefcaseIcon} size={11} strokeWidth={2} />
                        {jobMap.get(inv.jobId)?.title ?? "—"}
                      </span>
                      {inv.session && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <HugeiconsIcon icon={Calendar03Icon} size={11} strokeWidth={2} />
                          {new Date(inv.session.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>

                    {/* Mini score bars */}
                    {inv.summary && (
                      <div className="flex flex-col gap-1 mt-3">
                        {[
                          { label: "Technical",     score: inv.summary.technicalScore,     color: "bg-violet-500" },
                          { label: "Communication", score: inv.summary.communicationScore, color: "bg-blue-500" },
                        ].map(bar => (
                          <div key={bar.label} className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-20 shrink-0">{bar.label}</span>
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.score}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-foreground w-6 text-right">{bar.score}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Score badge + arrow */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {score !== null ? (
                      <div className={`rounded-xl border px-3 py-2 text-center ${scoreBg}`}>
                        <p className={`text-lg font-black ${scoreColor}`}>{score}</p>
                        <p className="text-[9px] text-muted-foreground">/ 100</p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-muted px-3 py-2 text-center">
                        <p className="text-xs text-muted-foreground">No score</p>
                      </div>
                    )}
                    <HugeiconsIcon icon={ArrowRight01Icon} size={13} className="text-muted-foreground group-hover:text-violet-400 transition-colors" strokeWidth={2} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selectedInvite && (
        <ResultDrawer invite={selectedInvite} onClose={() => setSelectedInvite(null)} />
      )}
    </div>
  );
}
