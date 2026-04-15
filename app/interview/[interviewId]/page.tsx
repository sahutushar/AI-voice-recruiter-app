import { db } from "@/db";
import { jobInvites, jobs, recruiterSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon, UserGroupIcon, Building04Icon, BriefcaseIcon,
  CheckmarkCircle01Icon, AiPhone01Icon, Calendar03Icon,
} from "@hugeicons/core-free-icons";
import InterviewHeader from "@/components/interview/InterviewHeader";
import InterviewJoinForm from "@/components/interview/InterviewJoinForm";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { type: string; duration: string }> = {
  SCR: { type: "AI Screening",   duration: "15–20 minutes" },
  TEC: { type: "Tech Interview", duration: "30–45 minutes" },
  HRF: { type: "HR Final Round", duration: "20–30 minutes" },
};

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) {
  const { interviewId } = await params;

  // Strategy 1: look up by exact interviewLink in job_invites
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

  // Strategy 3: show generic page if still no job found
  const [settings] = await db.select().from(recruiterSettings).limit(1);
  const companyName = settings?.companyName ?? "RecruiterAI";

  const prefix = interviewId.split("-")[0];
  const meta = TYPE_META[prefix] ?? { type: "AI Voice Interview", duration: "20–30 minutes" };

  const interview = {
    role: job?.title ?? "Open Position",
    company: companyName,
    type: meta.type,
    duration: meta.duration,
    level: job?.experience || "Open Level",
    techstack: job?.skills || "",
    department: job?.department || "",
    location: job?.location || "",
    description: job?.description || "",
    interviewId,
    postedDate: job
      ? new Date(job.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    instructions: [
      "Find a quiet place with a stable internet connection",
      "Use a device with a working microphone",
      "Speak clearly and take your time answering",
      "The AI interviewer will guide you through each question",
    ],
  };

  return (
    <div className="min-h-screen bg-[#05050f]">
      <InterviewHeader />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      <main className="relative pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
            <HugeiconsIcon icon={AiPhone01Icon} size={14} className="text-violet-400" strokeWidth={2} />
            <span className="text-violet-300 text-xs font-semibold tracking-wide">AI-Powered Interview</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">You&apos;re invited to interview</h1>
          <p className="text-white/50 text-base">Review the details below and enter your name to begin.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
                  <HugeiconsIcon icon={BriefcaseIcon} size={26} color="white" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white leading-tight">{interview.role}</h2>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <HugeiconsIcon icon={Building04Icon} size={14} className="text-white/40" strokeWidth={2} />
                    <span className="text-white/50 text-sm">{interview.company}</span>
                    {interview.department && <span className="text-white/30 text-sm">· {interview.department}</span>}
                    {interview.location && <span className="text-white/30 text-sm">· {interview.location}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-violet-500/15 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full border border-violet-500/20">{interview.level}</span>
                    <span className="bg-blue-500/15 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/20">{interview.type}</span>
                  </div>
                </div>
              </div>
              {interview.description && (
                <p className="text-sm text-white/50 mt-4 leading-relaxed line-clamp-3">{interview.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Clock01Icon,    label: "Duration", value: interview.duration,   color: "text-amber-400",   bg: "bg-amber-500/10" },
                { icon: UserGroupIcon,  label: "Level",    value: interview.level,      color: "text-violet-400",  bg: "bg-violet-500/10" },
                { icon: Calendar03Icon, label: "Posted",   value: interview.postedDate, color: "text-blue-400",    bg: "bg-blue-500/10" },
                { icon: AiPhone01Icon,  label: "Format",   value: interview.type,       color: "text-emerald-400", bg: "bg-emerald-500/10" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                    <HugeiconsIcon icon={item.icon} size={18} strokeWidth={2} className={item.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-white/40 font-medium">{item.label}</p>
                    <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {interview.techstack && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {interview.techstack.split(",").map((tech) => (
                    <span key={tech} className="bg-white/5 border border-white/10 text-white/70 text-sm font-medium px-3 py-1.5 rounded-lg">{tech.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Before You Begin</p>
              <ul className="flex flex-col gap-2.5">
                {interview.instructions.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={17} strokeWidth={2} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/65 leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">What to Expect</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { step: "01", title: "Greeting",        desc: "The AI interviewer will welcome you and introduce the session.",                          color: "text-violet-400", border: "border-violet-500/20", bg: "bg-violet-500/8" },
                  { step: "02", title: "Voice Questions", desc: `You will be asked questions spoken aloud by the AI agent one at a time.`,                  color: "text-blue-400",   border: "border-blue-500/20",   bg: "bg-blue-500/8" },
                  { step: "03", title: "Your Answers",    desc: "Speak your answers naturally. Silence detection will auto-advance to the next question.", color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/8" },
                  { step: "04", title: "AI Analysis",     desc: "Your responses are scored on technical depth and communication skills.",                  color: "text-amber-400",  border: "border-amber-500/20",  bg: "bg-amber-500/8" },
                  { step: "05", title: "Report Sent",     desc: "A structured report with your score and recommendation is sent to the recruiter.",       color: "text-pink-400",   border: "border-pink-500/20",   bg: "bg-pink-500/8" },
                ].map((item) => (
                  <div key={item.step} className={`flex items-start gap-3 p-3 rounded-xl border ${item.border} ${item.bg}`}>
                    <span className={`text-xs font-black ${item.color} shrink-0 mt-0.5 w-6 text-center`}>{item.step}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Join */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 sm:top-24 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 flex flex-col gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/30">
                  <HugeiconsIcon icon={AiPhone01Icon} size={30} color="white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-white">Ready to start?</h3>
                <p className="text-white/45 text-sm mt-1">Enter your full name as it appears on your resume.</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-white/35 font-medium mb-0.5">Interview ID</p>
                <p className="text-sm font-mono font-semibold text-violet-300 tracking-wider">{interviewId}</p>
              </div>
              <InterviewJoinForm interviewId={interviewId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
