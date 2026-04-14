"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  JobSearchIcon, UserGroupIcon, Loading03Icon, Delete02Icon,
  BriefcaseIcon, Location01Icon, Clock01Icon, MoneyBag01Icon,
  ChartAverageIcon, Search01Icon, CheckmarkCircle01Icon,
  FileEditIcon, SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddJobDialog from "./AddJobDialog";
import MatchAndInviteDialog from "./MatchAndInviteDialog";

interface Job {
  id: number; title: string; department: string; location: string;
  type: string; experience: string; salary: string; description: string;
  requirements: string; skills: string; status: string; createdAt: string;
}

interface Stats { total: number; active: number; draft: number; expired: number; }

const STATUS_CFG = {
  draft:   { label: "Draft",   cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  active:  { label: "Active",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  expired: { label: "Expired", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
} as const;

const STATUS_TRANSITIONS: Record<string, { next: string; label: string }[]> = {
  draft:   [{ next: "active", label: "Publish" }, { next: "expired", label: "Expire" }],
  active:  [{ next: "draft",  label: "Unpublish" }, { next: "expired", label: "Expire" }],
  expired: [{ next: "active", label: "Reactivate" }, { next: "draft", label: "Draft" }],
};

const STAT_CARDS = [
  { key: "total",   label: "Total Jobs",    icon: BriefcaseIcon,       iconBg: "bg-violet-500/15", iconColor: "text-violet-400",  gradient: "from-violet-500/10 to-transparent" },
  { key: "active",  label: "Active",        icon: CheckmarkCircle01Icon, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", gradient: "from-emerald-500/10 to-transparent" },
  { key: "draft",   label: "Drafts",        icon: FileEditIcon,        iconBg: "bg-amber-500/15",  iconColor: "text-amber-400",   gradient: "from-amber-500/10 to-transparent" },
  { key: "expired", label: "Expired",       icon: Clock01Icon,         iconBg: "bg-red-500/15",    iconColor: "text-red-400",     gradient: "from-red-500/10 to-transparent" },
] as const;

export default function JobsClient({ stats, jobs }: { stats: Stats; jobs: Job[] }) {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [matchJob, setMatchJob] = useState<Job | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "draft" | "expired">("all");

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const q = search.toLowerCase();
      const matchSearch = !q || j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) || j.skills.toLowerCase().includes(q);
      const matchFilter = filterStatus === "all" || j.status === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [jobs, search, filterStatus]);

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally { setUpdatingId(null); }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      router.refresh();
    } finally { setDeletingId(null); setConfirmId(null); }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage job postings and find matching candidates.</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 gap-2"
        >
          <HugeiconsIcon icon={JobSearchIcon} size={16} strokeWidth={2} />
          Add New Job
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAT_CARDS.map(({ key, label, icon, iconBg, iconColor, gradient }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key as typeof filterStatus)}
            className={`relative rounded-2xl border p-5 flex flex-col gap-3 text-left transition-all bg-gradient-to-br ${gradient} ${
              filterStatus === key ? "border-violet-500/50 ring-1 ring-violet-500/30" : "border-border hover:border-violet-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
              <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                <HugeiconsIcon icon={icon} size={16} strokeWidth={2} className={iconColor} />
              </div>
            </div>
            <span className="text-3xl font-bold text-foreground">{stats[key]}</span>
            {filterStatus === key && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500" />
            )}
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0 sm:min-w-48">
          <HugeiconsIcon icon={Search01Icon} size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, department, skills..."
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {(["all", "active", "draft", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? `All (${jobs.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${stats[f]})`}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <HugeiconsIcon icon={JobSearchIcon} size={26} className="text-muted-foreground" strokeWidth={2} />
          </div>
          <p className="font-semibold text-foreground">
            {jobs.length === 0 ? "No job postings yet" : "No jobs match your search"}
          </p>
          <p className="text-sm text-muted-foreground">
            {jobs.length === 0 ? "Click \"Add New Job\" to create your first posting." : "Try a different search or filter."}
          </p>
          {jobs.length === 0 && (
            <Button onClick={() => setShowAddDialog(true)} variant="outline" className="mt-2 gap-2">
              <HugeiconsIcon icon={JobSearchIcon} size={15} strokeWidth={2} />
              Create first job
            </Button>
          )}
        </div>
      )}

      {/* Job Cards */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((job) => {
            const sc = STATUS_CFG[job.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.draft;
            const transitions = STATUS_TRANSITIONS[job.status] ?? [];
            const isUpdating = updatingId === job.id;

            return (
              <div
                key={job.id}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-violet-500/20 transition-colors group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={BriefcaseIcon} size={20} className="text-violet-400" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate text-base">{job.title}</p>
                      {job.department && <p className="text-xs text-muted-foreground">{job.department}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.cls}`}>{sc.label}</span>
                    {confirmId === job.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(job.id)}
                          disabled={deletingId === job.id}
                          className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          {deletingId === job.id ? "..." : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(job.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={15} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {job.location && (
                    <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg">
                      <HugeiconsIcon icon={Location01Icon} size={11} strokeWidth={2} />{job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg capitalize">
                      <HugeiconsIcon icon={Clock01Icon} size={11} strokeWidth={2} />{job.type}
                    </span>
                  )}
                  {job.experience && (
                    <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg">
                      <HugeiconsIcon icon={ChartAverageIcon} size={11} strokeWidth={2} />{job.experience}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg">
                      <HugeiconsIcon icon={MoneyBag01Icon} size={11} strokeWidth={2} />{job.salary}
                    </span>
                  )}
                </div>

                {/* Description */}
                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
                )}

                {/* Skills */}
                {job.skills && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.split(",").slice(0, 6).map((s) => (
                      <span key={s} className="text-[11px] bg-violet-500/8 text-violet-300 border border-violet-500/15 px-2 py-0.5 rounded-md font-medium">
                        {s.trim()}
                      </span>
                    ))}
                    {job.skills.split(",").length > 6 && (
                      <span className="text-[11px] text-muted-foreground">+{job.skills.split(",").length - 6} more</span>
                    )}
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-border flex-wrap">
                  <span className="text-xs text-muted-foreground mr-auto">
                    {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>

                  {/* Status transitions */}
                  {transitions.map(({ next, label }) => (
                    <button
                      key={next}
                      onClick={() => handleStatusChange(job.id, next)}
                      disabled={isUpdating}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? "..." : label}
                    </button>
                  ))}

                  {/* Find Matches */}
                  <Button
                    size="sm"
                    onClick={() => setMatchJob(job)}
                    className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 gap-1.5 h-8 text-xs"
                  >
                    <HugeiconsIcon icon={SparklesIcon} size={13} strokeWidth={2} />
                    Find Matches
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddDialog && (
        <AddJobDialog
          onClose={() => setShowAddDialog(false)}
          onSaved={() => { setShowAddDialog(false); router.refresh(); }}
        />
      )}
      {matchJob && <MatchAndInviteDialog job={matchJob} onClose={() => setMatchJob(null)} />}
    </>
  );
}
