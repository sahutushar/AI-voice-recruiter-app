import { Upload01Icon, CallOutgoing01Icon, ChartBarIncreasingIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const steps = [
  {
    number: "01",
    icon: Upload01Icon,
    title: "Import Candidates",
    description:
      "Upload a CSV file or paste candidate details directly. RecruiterAI instantly parses names, contact info, job roles, and resume data.",
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/30",
    details: ["CSV / Excel upload", "Paste from ATS", "LinkedIn import"],
  },
  {
    number: "02",
    icon: CallOutgoing01Icon,
    title: "AI Calls Automatically",
    description:
      "Our voice agent calls each candidate at the optimal time, conducts a structured screening interview, and adapts questions based on responses.",
    color: "from-blue-500 to-cyan-600",
    glow: "shadow-blue-500/30",
    details: ["Natural voice conversations", "Dynamic follow-up questions", "Real-time transcription"],
  },
  {
    number: "03",
    icon: ChartBarIncreasingIcon,
    title: "Review & Schedule",
    description:
      "Get detailed reports with candidate scores, transcripts, and AI insights. Automatically schedule top candidates for the next interview round.",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/30",
    details: ["AI scoring & ranking", "Full transcripts", "Auto-scheduling"],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#05050f] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            From candidate import to interview scheduling — fully automated in three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                {/* Card */}
                <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 hover:bg-white/[0.05]">
                  {/* Step number */}
                  <div className="absolute -top-4 left-8">
                    <span className="text-xs font-mono font-bold text-white/20 bg-[#05050f] px-2">
                      STEP {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg ${step.glow}`}
                  >
                    <HugeiconsIcon icon={step.icon} size={26} color="white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">{step.description}</p>

                  {/* Detail list */}
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-sm text-white/40">
                        <span
                          className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${step.color} flex-shrink-0`}
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Arrow connector (between cards on desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#05050f] border border-white/10 items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6h8M7 3l3 3-3 3"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
