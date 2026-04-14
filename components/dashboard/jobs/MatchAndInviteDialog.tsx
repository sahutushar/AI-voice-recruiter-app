"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon, SparklesIcon, Loading03Icon, UserGroupIcon,
  CheckmarkCircle01Icon, ArrowRight01Icon, ArrowLeft01Icon,
  Copy01Icon, Tick01Icon, AiPhone01Icon, BriefcaseIcon, ChartAverageIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

interface Candidate {
  id: number; name: string; email: string;
  roleApplied: string; skills: string;
  matchScore?: number; reason?: string;
}
interface Job {
  id: number; title: string; skills: string; experience: string; description: string;
}
interface Props { job: Job; onClose: () => void; }

const INTERVIEW_TYPES = [
  { id: "screening", label: "AI Screening",   desc: "Initial automated screening call to assess basic fit",      color: "border-blue-500/40 bg-blue-500/5",    activeColor: "border-blue-500 bg-blue-500/15",    icon: AiPhone01Icon,  iconColor: "text-blue-400" },
  { id: "technical", label: "Tech Interview", desc: "In-depth technical assessment of skills and experience",    color: "border-violet-500/40 bg-violet-500/5", activeColor: "border-violet-500 bg-violet-500/15", icon: BriefcaseIcon,   iconColor: "text-violet-400" },
  { id: "hr-final",  label: "HR Final Round", desc: "Culture fit, compensation and final decision round",        color: "border-emerald-500/40 bg-emerald-500/5",activeColor: "border-emerald-500 bg-emerald-500/15",icon: UserGroupIcon,  iconColor: "text-emerald-400" },
];

function generateInterviewId(jobId: number, type: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const prefix = type === "screening" ? "SCR" : type === "technical" ? "TEC" : "HRF";
  return `${prefix}-${jobId}-${ts}-${rand}`;
}

export default function MatchAndInviteDialog({ job, onClose }: Props) {
  // ── All hooks first ──
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [aiMatches, setAiMatches] = useState<Candidate[]>([]);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [matchError, setMatchError] = useState("");
  const [isFallbackMatch, setIsFallbackMatch] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [interviewType, setInterviewType] = useState("screening");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentCount, setSentCount] = useState({ succeeded: 0, failed: 0 });
  const [sendError, setSendError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<Record<number, string>>({});

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [matchRes, candRes] = await Promise.all([
          fetch(`/api/jobs/${job.id}/match-candidates`, { method: "POST" }),
          fetch("/api/candidates"),
        ]);
        const matchData = await matchRes.json();
        const candData = await candRes.json();
        const matches: Candidate[] = matchRes.ok ? matchData.matches ?? [] : [];
        const allCands: Candidate[] = candData as Candidate[];
        const candById = new Map(allCands.map((c) => [c.id, c]));

        // Enrich AI matches with full candidate data (email, skills etc)
        const enrichedMatches: Candidate[] = matches
          .map((m) => ({ ...candById.get(m.id), ...m } as Candidate))
          .filter((m) => m.email); // only include if we have full data

        const matchIds = new Set(enrichedMatches.map((m) => m.id));
        const rest: Candidate[] = allCands.filter((c) => !matchIds.has(c.id));
        setAiMatches(enrichedMatches);
        setAllCandidates([...enrichedMatches, ...rest]);
        setSelected(new Set(enrichedMatches.map((m) => m.id)));
        if (!matchRes.ok) setMatchError(matchData.error ?? "AI matching failed");
        if (matchData._fallback) setIsFallbackMatch(true);
      } catch {
        setMatchError("Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [job.id]);

  // ── Derived values ──
  const displayed = showAll ? allCandidates : allCandidates.slice(0, 8);
  const selectedCandidates = allCandidates.filter((c) => selected.has(c.id));
  const typeConfig = INTERVIEW_TYPES.find((t) => t.id === interviewType)!;

  // ── Handlers ──
  const toggleOne = (id: number) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const toggleAll = () => {
    setSelected(selected.size === allCandidates.length ? new Set() : new Set(allCandidates.map((c) => c.id)));
  };

  const handleProceed = () => {
    if (selected.size === 0) return;
    const links: Record<number, string> = {};
    selected.forEach((id) => { links[id] = generateInterviewId(job.id, interviewType); });
    setGeneratedLinks(links);
    setStep(2);
  };

  const handleTypeChange = (type: string) => {
    setInterviewType(type);
    const links: Record<number, string> = {};
    selected.forEach((id) => { links[id] = generateInterviewId(job.id, type); });
    setGeneratedLinks(links);
  };

  const handleSendInvites = async () => {
    setSending(true);
    setSendError("");
    try {
      const payload = selectedCandidates.map((c) => ({
        id: c.id, name: c.name, email: c.email,
        interviewLink: generatedLinks[c.id] ?? "",
      }));

      // 1. Save invites to DB
      await Promise.all(
        payload.map((c) =>
          fetch("/api/job-invites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobId: job.id,
              candidateId: c.id,
              interviewLink: c.interviewLink,
            }),
          })
        )
      );

      // 2. Send emails
      const res = await fetch(`/api/jobs/${job.id}/send-invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: payload, jobTitle: job.title, interviewType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send invites");
      if (data.failed > 0 && data.succeeded === 0) throw new Error(`All ${data.failed} emails failed to send.`);
      setSentCount({ succeeded: data.succeeded, failed: data.failed });
      setSent(true);
    } catch (e: unknown) {
      setSendError((e as Error).message || "Failed to send invites. Try again.");
    } finally {
      setSending(false);
    }
  };

  const copyLink = (id: number, link: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/interview/${link}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <HugeiconsIcon icon={UserGroupIcon} size={18} className="text-violet-400" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {step === 1 ? "Find & Select Candidates" : "Send Interview Invites"}
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-xs">{job.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 1 ? "bg-violet-600 text-white" : "bg-emerald-500/20 text-emerald-400"}`}>
                {step === 1 ? "1" : <HugeiconsIcon icon={Tick01Icon} size={12} strokeWidth={2.5} />}
              </div>
              <div className="w-6 h-px bg-border" />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 2 ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground"}`}>2</div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="px-6 py-5 flex flex-col gap-4 flex-1">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <HugeiconsIcon icon={Loading03Icon} size={28} className="text-violet-400 animate-spin" strokeWidth={2} />
                <p className="text-sm text-muted-foreground">AI is finding best matches...</p>
              </div>
            ) : (
              <>
                {matchError && <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">{matchError}</p>}

                {aiMatches.length > 0 && (
                  <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${
                    isFallbackMatch
                      ? "text-amber-300 bg-amber-500/8 border-amber-500/20"
                      : "text-violet-300 bg-violet-500/8 border-violet-500/20"
                  }`}>
                    <HugeiconsIcon icon={SparklesIcon} size={13} strokeWidth={2} />
                    {isFallbackMatch
                      ? <span>Matched <strong>{aiMatches.length}</strong> candidates by skill score (AI quota reached). You can adjust below.</span>
                      : <span>AI pre-selected <strong>{aiMatches.length}</strong> top matches. You can adjust below.</span>
                    }
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button onClick={toggleAll} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selected.size === allCandidates.length && allCandidates.length > 0 ? "bg-violet-600 border-violet-600" : "border-border"}`}>
                      {selected.size === allCandidates.length && allCandidates.length > 0 && <HugeiconsIcon icon={Tick01Icon} size={10} color="white" strokeWidth={3} />}
                    </div>
                    Select all ({allCandidates.length})
                  </button>
                  <span className="text-xs text-muted-foreground">{selected.size} selected</span>
                </div>

                <div className="flex flex-col gap-2">
                  {displayed.map((c) => {
                    const isMatch = aiMatches.some((m) => m.id === c.id);
                    const isSelected = selected.has(c.id);
                    return (
                      <button key={c.id} onClick={() => toggleOne(c.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isSelected ? "border-violet-500/50 bg-violet-500/8" : "border-border hover:bg-muted/30"}`}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-violet-600 border-violet-600" : "border-border"}`}>
                          {isSelected && <HugeiconsIcon icon={Tick01Icon} size={10} color="white" strokeWidth={3} />}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                            {isMatch && (
                              <span className="text-[10px] font-bold bg-violet-500/15 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                <HugeiconsIcon icon={SparklesIcon} size={9} strokeWidth={2} />AI Match
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{c.roleApplied}</p>
                          {c.reason && <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{c.reason}</p>}
                        </div>
                        {c.matchScore != null && (
                          <div className="flex items-center gap-1 shrink-0">
                            <HugeiconsIcon icon={ChartAverageIcon} size={13} className="text-emerald-400" strokeWidth={2} />
                            <span className="text-sm font-bold text-emerald-400">{c.matchScore}%</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {allCandidates.length > 8 && (
                  <button onClick={() => setShowAll((p) => !p)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors text-center">
                    {showAll ? "Show less" : `Show ${allCandidates.length - 8} more candidates`}
                  </button>
                )}
                {allCandidates.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No candidates in your pool yet.</div>}
              </>
            )}
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="px-6 py-5 flex flex-col gap-5 flex-1">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={32} className="text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Invites Sent!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong className="text-emerald-400">{sentCount.succeeded}</strong> email{sentCount.succeeded !== 1 ? "s" : ""} sent for <strong className="text-foreground">{typeConfig.label}</strong>
                    {sentCount.failed > 0 && <span className="text-amber-400"> · {sentCount.failed} failed</span>}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground max-w-sm">Candidates will receive their interview link via email.</p>
                <Button onClick={onClose} className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 mt-2">Done</Button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Select Interview Type</p>
                  <div className="flex flex-col gap-2">
                    {INTERVIEW_TYPES.map((t) => (
                      <button key={t.id} onClick={() => handleTypeChange(t.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${interviewType === t.id ? t.activeColor : t.color} hover:opacity-90`}>
                        <div className={`w-9 h-9 rounded-lg ${interviewType === t.id ? "bg-white/10" : "bg-white/5"} flex items-center justify-center shrink-0`}>
                          <HugeiconsIcon icon={t.icon} size={18} className={t.iconColor} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{t.label}</p>
                          <p className="text-xs text-muted-foreground">{t.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${interviewType === t.id ? "border-current bg-current" : "border-border"}`}>
                          {interviewType === t.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Interview Links — {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                    {selectedCandidates.map((c) => {
                      const link = generatedLinks[c.id] ?? "";
                      return (
                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                          <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                            {c.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">{c.name}</p>
                            <p className="text-[11px] font-mono text-muted-foreground truncate">/interview/{link}</p>
                          </div>
                          <button onClick={() => copyLink(c.id, link)}
                            className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                            <HugeiconsIcon icon={copiedId === c.id ? Tick01Icon : Copy01Icon} size={15} strokeWidth={2} className={copiedId === c.id ? "text-emerald-400" : ""} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        {!sent && (
          <div className="px-6 py-4 border-t border-border flex items-center gap-3 sticky bottom-0 bg-card">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={2} />Back
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {step === 1 ? (
              <Button onClick={handleProceed} disabled={selected.size === 0 || loading}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 gap-2">
                Send Invite ({selected.size})
                <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={2} />
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-1">
                {sendError && <p className="text-xs text-red-400">{sendError}</p>}
                <Button onClick={handleSendInvites} disabled={sending}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 gap-2">
                  {sending
                    ? <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin" strokeWidth={2} />
                    : <HugeiconsIcon icon={Tick01Icon} size={15} strokeWidth={2} />}
                  {sending ? "Sending..." : `Send ${selected.size} Invite${selected.size !== 1 ? "s" : ""}`}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
