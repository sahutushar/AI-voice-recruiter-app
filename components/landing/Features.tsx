import {
  AiPhone01Icon,
  AiFileIcon,
  AiBrain01Icon,
  Calendar01Icon,
  ChartBarIncreasingIcon,
  AiSecurity01Icon,
  AiVoiceIcon,
  AiUserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const features = [
  {
    icon: AiPhone01Icon,
    title: "Automated Voice Calls",
    description:
      "AI agent places outbound calls to candidates with a natural, human-like voice. No robotic scripts — real conversations.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: AiFileIcon,
    title: "Smart Resume Parsing",
    description:
      "Automatically extract skills, experience, and qualifications from resumes to personalize each screening call.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: AiBrain01Icon,
    title: "Adaptive AI Questions",
    description:
      "Dynamic question generation based on job requirements and candidate responses. No two interviews are the same.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: Calendar01Icon,
    title: "Auto Interview Scheduling",
    description:
      "Top candidates are automatically offered interview slots based on recruiter availability. Zero back-and-forth emails.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: ChartBarIncreasingIcon,
    title: "Candidate Scoring & Reports",
    description:
      "Every call generates a detailed report with scores, key highlights, red flags, and a recommendation summary.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: AiSecurity01Icon,
    title: "Secure & Compliant",
    description:
      "GDPR and CCPA compliant. All calls are encrypted, transcripts are stored securely, and consent is captured automatically.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: AiVoiceIcon,
    title: "Multi-Language Support",
    description:
      "Conduct screening interviews in 20+ languages. Reach global talent without language barriers.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: AiUserIcon,
    title: "ATS Integration",
    description:
      "Seamlessly sync with Greenhouse, Lever, Workday, and more. Candidate data flows automatically into your existing workflow.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-[#07070f] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Everything You Need
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            RecruiterAI combines cutting-edge voice AI with smart automation to transform your
            hiring pipeline.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 cursor-default"
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center mb-4`}
              >
                <HugeiconsIcon icon={feature.icon} size={22} className={feature.color} />
              </div>

              <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{feature.description}</p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-violet-500/5 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
