"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAdd01Icon, UserGroupIcon, CheckmarkCircle01Icon, Clock01Icon,
  ChartAverageIcon, BriefcaseIcon, Cancel01Icon, Search01Icon,
  GridViewIcon, ListViewIcon, Delete02Icon, ArrowLeft01Icon, ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddCandidateDialog from "./AddCandidateDialog";
import Link from "next/link";

interface Candidate {
  id: number; name: string; email: string; phone: string;
  roleApplied: string; experience: string; skills: string;
  status: string; createdAt: string;
}
interface Session {
  id: number; candidateName: string; role: string; level: string;
  status: string; createdAt: string; overallScore?: number; recommendation?: string;
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  new:       { label: "New",       cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  screening: { label: "Screening", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  interview: { label: "Interview", cls: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  hired:     { label: "Hired",     cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  rejected:  { label: "Rejected",  cls: "bg-red-500/15 text-red-400 border-red-500/20" },
};
const REC_CFG: Record<string, { label: string; cls: string }> = {
  hire:  { label: "Hire",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  maybe: { label: "Maybe", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  no:    { label: "No",    cls: "bg-red-500/15 text-red-400 border-red-500/20" },
};

const PAGE_SIZE = 9;

export default function CandidatesClient({
  candidates, sessions,
}: { candidates: Candidate[]; sessions: Session[] }) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"candidates" | "sessions">("candidates");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // ── Filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return candidates;
    return candidates.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.roleApplied.toLowerCase().includes(q) ||
      c.skills.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  // ── Delete ──
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(`/api/candidates/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const handleSaved = () => { setShowDialog(false); router.refresh(); };

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage candidates and view interview results.</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 gap-2"
        >
          <HugeiconsIcon icon={UserAdd01Icon} size={16} strokeWidth={2} />
          Add Candidate
        </Button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
        {(["candidates", "sessions"] as const).map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); setSearch(""); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {tab === "candidates" ? `Candidates (${candidates.length})` : `Sessions (${sessions.length})`}
          </button>
        ))}
      </div>

      {/* ── Candidates Tab ── */}
      {activeTab === "candidates" && (
        <div className="flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
              <Input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, email, role, skills..."
                className="pl-9 h-9"
              />
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <button onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <HugeiconsIcon icon={GridViewIcon} size={16} strokeWidth={2} />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <HugeiconsIcon icon={ListViewIcon} size={16} strokeWidth={2} />
              </button>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-12 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <HugeiconsIcon icon={UserGroupIcon} size={26} className="text-muted-foreground" strokeWidth={2} />
              </div>
              <p className="font-semibold text-foreground">{search ? "No candidates match your search" : "No candidates yet"}</p>
              <p className="text-sm text-muted-foreground">{search ? "Try a different search term." : "Click \"Add Candidate\" to get started."}</p>
              {!search && (
                <Button onClick={() => setShowDialog(true)} variant="outline" className="mt-2 gap-2">
                  <HugeiconsIcon icon={UserAdd01Icon} size={15} strokeWidth={2} />
                  Add your first candidate
                </Button>
              )}
            </div>
          )}

          {/* Grid view */}
          {filtered.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map((c) => {
                const sc = STATUS_CFG[c.status] ?? STATUS_CFG.new;
                return (
                  <div key={c.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-violet-500/30 transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 font-bold text-base shrink-0">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.cls}`}>{sc.label}</span>
                        {/* Delete button */}
                        {confirmId === c.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                              className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg hover:bg-red-500/20 transition-colors">
                              {deletingId === c.id ? "..." : "Yes"}
                            </button>
                            <button onClick={() => setConfirmId(null)}
                              className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg hover:bg-muted/80 transition-colors">
                              No
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(c.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10">
                            <HugeiconsIcon icon={Delete02Icon} size={15} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <HugeiconsIcon icon={BriefcaseIcon} size={14} className="text-muted-foreground shrink-0" strokeWidth={2} />
                        <span className="text-foreground font-medium truncate">{c.roleApplied}</span>
                      </div>
                      {c.experience && <p className="text-xs text-muted-foreground">{c.experience} experience</p>}
                      {c.skills && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.skills.split(",").slice(0, 4).map((s) => (
                            <span key={s} className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{s.trim()}</span>
                          ))}
                          {c.skills.split(",").length > 4 && (
                            <span className="text-[11px] text-muted-foreground">+{c.skills.split(",").length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-GB")}</span>
                      {c.phone && <span className="text-xs text-muted-foreground">{c.phone}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List view */}
          {filtered.length > 0 && viewMode === "list" && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Candidate", "Role", "Experience", "Skills", "Status", "Added", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((c) => {
                    const sc = STATUS_CFG[c.status] ?? STATUS_CFG.new;
                    return (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                              {c.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-foreground">{c.roleApplied}</td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground">{c.experience || "—"}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {c.skills.split(",").slice(0, 3).map((s) => (
                              <span key={s} className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{s.trim()}</span>
                            ))}
                            {c.skills.split(",").length > 3 && (
                              <span className="text-[11px] text-muted-foreground">+{c.skills.split(",").length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-GB")}</td>
                        <td className="px-5 py-3.5">
                          {confirmId === c.id ? (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                                className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
                                {deletingId === c.id ? "Deleting..." : "Confirm"}
                              </button>
                              <span className="text-muted-foreground">·</span>
                              <button onClick={() => setConfirmId(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmId(c.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 flex items-center gap-1 text-xs">
                              <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={2} />
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} /> Prev
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Sessions Tab ── */}
      {activeTab === "sessions" && (
        sessions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <HugeiconsIcon icon={Clock01Icon} size={26} className="text-muted-foreground" strokeWidth={2} />
            </div>
            <p className="font-semibold text-foreground">No interview sessions yet</p>
            <p className="text-sm text-muted-foreground">Sessions appear here after candidates complete interviews.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Candidate", "Role", "Score", "Recommendation", "Status", "Date", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sessions.map((s) => {
                  const rc = s.recommendation ? (REC_CFG[s.recommendation] ?? REC_CFG.maybe) : null;
                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 font-bold text-sm">
                            {s.candidateName[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-foreground">{s.candidateName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><p className="font-medium text-foreground">{s.role}</p><p className="text-xs text-muted-foreground">{s.level}</p></td>
                      <td className="px-5 py-4">
                        {s.overallScore != null ? (
                          <div className="flex items-center gap-1.5">
                            <HugeiconsIcon icon={ChartAverageIcon} size={14} className="text-violet-400" strokeWidth={2} />
                            <span className="font-bold text-foreground">{s.overallScore}</span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                        ) : <span className="text-muted-foreground text-xs">Pending</span>}
                      </td>
                      <td className="px-5 py-4">
                        {rc ? <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${rc.cls}`}>{rc.label}</span>
                          : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <HugeiconsIcon
                            icon={s.status === "completed" ? CheckmarkCircle01Icon : s.status === "incomplete" ? Cancel01Icon : Clock01Icon}
                            size={14}
                            className={s.status === "completed" ? "text-emerald-400" : s.status === "incomplete" ? "text-red-400" : "text-amber-400"}
                            strokeWidth={2}
                          />
                          <span className={`text-xs font-medium capitalize ${s.status === "completed" ? "text-emerald-400" : s.status === "incomplete" ? "text-red-400" : "text-amber-400"}`}>
                            {s.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("en-GB")}</td>
                      <td className="px-5 py-4">
                        <Link href={`/dashboard/candidates/${s.id}`} className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">View →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )
      )}

      {showDialog && <AddCandidateDialog onClose={() => setShowDialog(false)} onSaved={handleSaved} />}
    </>
  );
}
