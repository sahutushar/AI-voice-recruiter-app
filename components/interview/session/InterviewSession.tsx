"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInterviewSession } from "./useInterviewSession";
import AgentAvatar from "./AgentAvatar";
import WebcamView from "./WebcamView";
import ChatPanel from "./ChatPanel";
import CallControls from "./CallControls";
import InterviewHeader from "@/components/interview/InterviewHeader";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiPhone01Icon, CheckmarkCircle01Icon,
  Clock01Icon, MessageMultiple01Icon, ChartAverageIcon,
  ArrowRight01Icon, Mail01Icon, UserIcon, SparklesIcon,
} from "@hugeicons/core-free-icons";

// ── Completion page ───────────────────────────────────────────────────────────
function CompletionPage({
  candidateName, role, company, totalQuestions,
  questionsAttempted, durationSecs, messages, onHome,
}: {
  candidateName: string; role: string; company: string;
  totalQuestions: number; questionsAttempted: number;
  durationSecs: number; messages: import("./useInterviewSession").ChatMessage[];
  onHome: () => void;
}) {
  const mins     = Math.floor(durationSecs / 60);
  const secs     = durationSecs % 60;
  const duration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  const answers    = messages.filter(m => m.role === "user" && m.text !== "(no response)");
  const aiMessages = messages.filter(m => m.role === "ai");

  return (
    <div className="min-h-screen bg-[#05050f] flex flex-col">
      <InterviewHeader />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/6 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">

          {/* Hero */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500/15 to-violet-500/10 border border-emerald-500/25 p-6 text-center">
            <div className="absolute -top-8 -right-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={32} className="text-emerald-400" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Interview Complete!</h1>
              <p className="text-white/50 text-sm">
                Great job, <span className="text-white font-semibold">{candidateName}</span>! You&apos;ve completed your AI interview for{" "}
                <span className="text-violet-300 font-semibold">{role}</span> at <span className="text-white/70">{company}</span>.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: MessageMultiple01Icon, label: "Questions Attempted", value: `${questionsAttempted} / ${totalQuestions}`, sub: questionsAttempted === totalQuestions ? "All completed" : `${totalQuestions - questionsAttempted} skipped`, color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/20" },
              { icon: Clock01Icon,           label: "Duration",            value: duration,                                    sub: "Total interview time",                                                                                          color: "text-blue-400",   bg: "bg-blue-500/15",   border: "border-blue-500/20" },
              { icon: ChartAverageIcon,      label: "Answers Recorded",    value: `${answers.length}`,                         sub: `of ${totalQuestions} questions`,                                                                               color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/20" },
            ].map(stat => (
              <div key={stat.label} className={`rounded-2xl border ${stat.border} bg-white/[0.03] p-4 flex flex-col gap-3`}>
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <HugeiconsIcon icon={stat.icon} size={18} className={stat.color} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs font-semibold text-white/60 mt-0.5">{stat.label}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Q&A */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={MessageMultiple01Icon} size={16} className="text-violet-400" strokeWidth={2} />
              <h2 className="text-sm font-bold text-white">Questions &amp; Your Answers</h2>
            </div>
            <div className="flex flex-col gap-3">
              {aiMessages.map((q, i) => {
                const answer = answers[i];
                return (
                  <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-black text-violet-400 bg-violet-500/15 border border-violet-500/20 px-1.5 py-0.5 rounded-md shrink-0 mt-0.5">Q{i + 1}</span>
                      <p className="text-sm text-white/80 leading-relaxed">{q.text}</p>
                    </div>
                    <div className="flex items-start gap-2 pl-7">
                      <HugeiconsIcon icon={UserIcon} size={13} className="text-white/30 shrink-0 mt-0.5" strokeWidth={2} />
                      <p className="text-xs text-white/50 leading-relaxed italic">
                        {answer ? answer.text : <span className="text-white/25">No response recorded</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What happens next */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.03] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} size={16} className="text-blue-400" strokeWidth={2} />
              <h2 className="text-sm font-bold text-white">What Happens Next</h2>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: ChartAverageIcon, title: "AI Analysis",       desc: "Your responses are being analyzed for technical depth, communication, and role fit.",          color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20", status: "In progress", statusColor: "text-amber-400" },
                { icon: Mail01Icon,       title: "Recruiter Notified", desc: `The recruiter at ${company} will receive a full report with your scores and recommendation.`, color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",   status: "Sent",        statusColor: "text-emerald-400" },
                { icon: AiPhone01Icon,    title: "Decision",           desc: "The recruiter will review your report and reach out to you via email with next steps.",        color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", status: "Pending",     statusColor: "text-white/40" },
              ].map(step => (
                <div key={step.title} className={`flex items-start gap-3 p-3 rounded-xl border ${step.border} ${step.bg}`}>
                  <div className={`w-8 h-8 rounded-lg ${step.bg} border ${step.border} flex items-center justify-center shrink-0`}>
                    <HugeiconsIcon icon={step.icon} size={16} className={step.color} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <span className={`text-[10px] font-bold ${step.statusColor}`}>{step.status}</span>
                    </div>
                    <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onHome}
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            Return to Home
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.5} />
          </button>

        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface SessionProps {
  interviewId: string; candidateName: string;
  role: string; level: string; techstack: string; company: string;
}

export default function InterviewSession(props: SessionProps) {
  const router = useRouter();
  const [startTime, setStartTime]       = useState<number>(0);
  const [durationSecs, setDurationSecs] = useState(0);

  const details = useRef({
    interviewId:   props.interviewId,
    role:          props.role,
    level:         props.level,
    techstack:     props.techstack,
    company:       props.company,
    candidateName: props.candidateName,
  }).current;

  const {
    status, messages, isAgentSpeaking, isMuted, isCameraOff,
    currentTranscript, stream, summary,
    startSession, toggleMute, toggleCamera, endCall,
    questionIndex, totalQuestions,
  } = useInterviewSession(details);

  // Start session on mount — getUserMedia inside startSession triggers the browser popup
  useEffect(() => {
    setStartTime(Date.now());
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Capture duration when interview ends
  useEffect(() => {
    if (status === "ended" && startTime > 0) {
      setDurationSecs(Math.floor((Date.now() - startTime) / 1000));
    }
  }, [status, startTime]);

  const questionsAttempted = Math.max(0, messages.filter(m => m.role === "ai").length - 2);
  const isEnded = status === "ended";

  // ── Ended ─────────────────────────────────────────────────────────────────
  if (isEnded) {
    return (
      <CompletionPage
        candidateName={props.candidateName}
        role={props.role}
        company={props.company}
        totalQuestions={totalQuestions}
        questionsAttempted={questionsAttempted}
        durationSecs={durationSecs}
        messages={messages}
        onHome={() => router.push("/")}
      />
    );
  }

  // ── Active / loading ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#05050f] flex flex-col">
      <InterviewHeader />

      {/* Loading while permissions are being requested */}
      {(status === "idle" || status === "requesting-permissions") && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <HugeiconsIcon icon={AiPhone01Icon} size={30} className="text-violet-400" strokeWidth={2} />
            </div>
            <p className="text-white font-semibold text-lg">Setting up your interview...</p>
            <p className="text-white/40 text-sm mt-2">Please allow camera and microphone access when prompted.</p>
          </div>
        </div>
      )}

      {/* Active interview */}
      {status !== "idle" && status !== "requesting-permissions" && (
        <>
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
          </div>

          <main className="relative flex-1 flex flex-col pt-16 overflow-hidden">
            <div className="px-6 pt-4 pb-2 flex items-center gap-3 shrink-0">
              <span className="text-xs text-white/40 font-medium shrink-0">
                Question {Math.min(questionIndex, totalQuestions)} / {totalQuestions}
              </span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${(Math.min(questionIndex, totalQuestions) / totalQuestions) * 100}%` }} />
              </div>
              <span className="text-xs text-white/40 font-medium shrink-0">{props.role}</span>
            </div>

            <div className="flex-1 flex flex-col gap-4 lg:flex-row px-4 pb-4 min-h-0">
              <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center p-6">
                    <AgentAvatar isSpeaking={isAgentSpeaking} status={status} />
                  </div>
                  <div className="rounded-2xl overflow-hidden">
                    <WebcamView stream={stream} isCameraOff={isCameraOff} candidateName={props.candidateName} />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-4 px-6 shrink-0">
                  <CallControls isMuted={isMuted} isCameraOff={isCameraOff}
                    onToggleMute={toggleMute} onToggleCamera={toggleCamera}
                    onEndCall={endCall} disabled={false} />
                </div>
              </div>

              <div className="w-full lg:w-80 xl:w-96 shrink-0 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col min-h-0 overflow-hidden" style={{ height: '320px' }}>
                <ChatPanel messages={messages} currentTranscript={currentTranscript}
                  status={status} candidateName={props.candidateName} />
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
