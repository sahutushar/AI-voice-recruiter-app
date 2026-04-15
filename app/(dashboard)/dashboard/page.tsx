import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { jobs, candidates, jobInvites, interviewSessions, interviewSummaries } from "@/db/schema";
import { desc } from "drizzle-orm";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  JobSearchIcon, UserGroupIcon, Calendar03Icon, ChartAverageIcon,
  UserAdd01Icon, CallRinging01Icon, CheckmarkCircle01Icon, AiPhone01Icon,
  Clock01Icon, ArrowRight01Icon, Settings01Icon, SparklesIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

export const dynamic = "force-dynamic";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const firstName = user.firstName ?? "there";

  const [allJobs, allCandidates, allInvites, recentSessions, allSummaries] = await Promise.all([
    db.select().from(jobs),
    db.select().from(candidates),
    db.select().from(jobInvites),
    db.select().from(interviewSessions).orderBy(desc(interviewSessions.createdAt)).limit(20),
    db.select().from(interviewSummaries),
  ]);

  const activeJobs = allJobs.filter((j) => j.status === "active").length;
  const totalCandidates = allCandidates.length;
  const pendingInvites = allInvites.filter((i) => i.status === "pending").length;
  const completedInvites = allInvites.filter((i) => i.status === "completed").length;

  // Screening rate = completed / total invited * 100
  const screeningRate = allInvites.length > 0
    ? Math.round((completedInvites / allInvites.length) * 100)
    : 0;

  const summaryMap = new Map(allSummaries.map((s) => [s.sessionId, s]));

  const stats = [
    {
      label: "Active Jobs",
      value: activeJobs.toString(),
      sub: `${allJobs.length} total postings`,
      icon: JobSearchIcon,
      gradient: "from-violet-500/20 to-violet-600/5",
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/15",
      href: "/dashboard/jobs",
    },
    {
      label: "Total Candidates",
      value: totalCandidates.toString(),
      sub: `${allInvites.length} invited`,
      icon: UserGroupIcon,
      gradient: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/15",
      href: "/dashboard/candidates",
    },
    {
      label: "Pending Interviews",
      value: pendingInvites.toString(),
      sub: `${completedInvites} completed`,
      icon: Calendar03Icon,
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15",
      href: "/dashboard/interviews",
    },
    {
      label: "Screening Rate",
      value: screeningRate > 0 ? `${screeningRate}%` : "—",
      sub: `${completedInvites} of ${allInvites.length} completed`,
      icon: ChartAverageIcon,
      gradient: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/15",
      href: "/dashboard/interviews",
    },
  ];

  // Build activity feed
  type ActivityItem = {
    icon: typeof UserAdd01Icon;
    iconBg: string;
    iconColor: string;
    title: string;
    desc: string;
    time: string;
    href?: string;
  };

  const activity: ActivityItem[] = [];

  for (const session of recentSessions.slice(0, 6)) {
    const summary = summaryMap.get(session.id);
    activity.push({
      icon: summary ? CheckmarkCircle01Icon : CallRinging01Icon,
      iconBg: summary ? "bg-emerald-500/15" : "bg-violet-500/15",
      iconColor: summary ? "text-emerald-400" : "text-violet-400",
      title: summary ? "Interview completed" : "Interview in progress",
      desc: `${session.candidateName} — ${session.role}${summary ? ` · Score: ${summary.overallScore}%` : ""}`,
      time: timeAgo(new Date(session.createdAt)),
      href: `/dashboard/candidates/${session.id}`,
    });
  }

  const recentCandidates = [...allCandidates]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  for (const c of recentCandidates) {
    activity.push({
      icon: UserAdd01Icon,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
      title: "Candidate added",
      desc: `${c.name} — ${c.roleApplied}`,
      time: timeAgo(new Date(c.createdAt)),
      href: "/dashboard/candidates",
    });
  }

  const recentJobs = [...allJobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);
  for (const j of recentJobs) {
    activity.push({
      icon: JobSearchIcon,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      title: j.status === "active" ? "Job published" : "Job created",
      desc: `${j.title}${j.department ? ` · ${j.department}` : ""}`,
      time: timeAgo(new Date(j.createdAt)),
      href: "/dashboard/jobs",
    });
  }

  const sortedActivity = activity.slice(0, 8);

  const quickActions = [
    {
      label: "Post a Job",
      desc: "Create a new job posting",
      icon: JobSearchIcon,
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-400",
      href: "/dashboard/jobs",
    },
    {
      label: "Add Candidate",
      desc: "Add candidate to your pool",
      icon: UserAdd01Icon,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
      href: "/dashboard/candidates",
    },
    {
      label: "View Interviews",
      desc: "Check scheduled interviews",
      icon: Calendar03Icon,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      href: "/dashboard/interviews",
    },
    {
      label: "Configure AI",
      desc: "Tune agent & prompts",
      icon: Settings01Icon,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl">

      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0f0a1e] border border-violet-500/30 p-6 md:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-blue-600/15 rounded-full blur-2xl" />
        </div>
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-xl shadow-violet-500/40 shrink-0">
            <HugeiconsIcon icon={AiPhone01Icon} size={30} color="white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm text-violet-300 font-semibold mb-1 tracking-wide">Welcome back 👋</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Good to see you, <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">{firstName}</span>!
            </h1>
            <p className="text-white/70 text-sm mt-1.5 font-medium">
              {activeJobs > 0
                ? `You have ${activeJobs} active job${activeJobs !== 1 ? "s" : ""} and ${pendingInvites} pending interview${pendingInvites !== 1 ? "s" : ""}.`
                : "Your AI recruiting pipeline is ready. Add a job to get started."}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className={`relative rounded-2xl border border-border bg-gradient-to-br ${stat.gradient} p-5 flex flex-col gap-4 overflow-hidden hover:border-violet-500/30 transition-colors group`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <HugeiconsIcon icon={stat.icon} size={20} strokeWidth={2} className={stat.iconColor} />
              </div>
            </div>
            <div>
              <span className="text-4xl font-bold text-foreground">{stat.value}</span>
              <p className="text-xs mt-1 font-medium text-muted-foreground">{stat.sub}</p>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2}
              className="absolute bottom-4 right-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Bottom: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent Activity — takes 2/3 */}
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest updates from your pipeline</p>
            </div>
            <Link href="/dashboard/candidates"
              className="text-xs text-violet-400 font-medium hover:text-violet-300 transition-colors flex items-center gap-1">
              View all <HugeiconsIcon icon={ArrowRight01Icon} size={12} strokeWidth={2.5} />
            </Link>
          </div>

          {sortedActivity.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <HugeiconsIcon icon={Clock01Icon} size={22} className="text-muted-foreground" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground">Add a job and invite candidates to get started.</p>
              <Link href="/dashboard/jobs"
                className="mt-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                Add your first job <HugeiconsIcon icon={ArrowRight01Icon} size={12} strokeWidth={2.5} />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {sortedActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <HugeiconsIcon icon={item.icon} size={17} strokeWidth={2} className={item.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground/60">{item.time}</span>
                    {item.href && (
                      <Link href={item.href} className="text-muted-foreground/40 hover:text-violet-400 transition-colors">
                        <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2.5} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions — takes 1/3 */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <HugeiconsIcon icon={SparklesIcon} size={16} className="text-violet-400" strokeWidth={2} />
              <h2 className="text-base font-semibold text-foreground">Quick Actions</h2>
            </div>
            <p className="text-xs text-muted-foreground">Jump to common tasks</p>
          </div>

          <div className="flex flex-col gap-2">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-violet-500/30 hover:bg-muted/30 transition-all group">
                <div className={`w-9 h-9 rounded-lg ${action.iconBg} flex items-center justify-center shrink-0`}>
                  <HugeiconsIcon icon={action.icon} size={18} strokeWidth={2} className={action.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2}
                  className="text-muted-foreground/30 group-hover:text-violet-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          {/* Pipeline summary */}
          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pipeline</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Jobs Active",   value: activeJobs,        color: "bg-violet-500" },
                { label: "Invited",       value: allInvites.length, color: "bg-blue-500" },
                { label: "Completed",     value: completedInvites,  color: "bg-emerald-500" },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${p.color}`} />
                    <span className="text-muted-foreground">{p.label}</span>
                  </div>
                  <span className="font-bold text-foreground">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
