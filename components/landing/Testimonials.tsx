import { QuoteUpIcon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const testimonials = [
  {
    quote:
      "RecruiterAI cut our time-to-screen from 2 weeks to 2 days. The AI asks better follow-up questions than most of our junior recruiters. Absolutely game-changing.",
    name: "Sarah Mitchell",
    role: "Head of Talent Acquisition",
    company: "TechScale Inc.",
    avatar: "SM",
    avatarColor: "from-violet-500 to-purple-600",
    stars: 5,
  },
  {
    quote:
      "We were skeptical about AI calls, but candidates actually prefer it — no scheduling hassle, available 24/7. Our offer acceptance rate went up 30% since we started using RecruiterAI.",
    name: "James Okafor",
    role: "VP of People Operations",
    company: "Finova Labs",
    avatar: "JO",
    avatarColor: "from-blue-500 to-cyan-600",
    stars: 5,
  },
  {
    quote:
      "The candidate scoring is incredibly accurate. We've hired 40+ engineers using RecruiterAI and the quality of hires has never been better. ROI was clear within the first month.",
    name: "Priya Sharma",
    role: "Engineering Recruiter",
    company: "CloudBurst Systems",
    avatar: "PS",
    avatarColor: "from-emerald-500 to-teal-600",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-[#05050f] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Social Proof
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Loved by Recruiters
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Join hundreds of talent teams who&apos;ve transformed their hiring process with RecruiterAI.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-7 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
            >
              {/* Quote icon */}
              <div className="mb-4">
                <HugeiconsIcon icon={QuoteUpIcon} size={28} className="text-violet-500/60" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <HugeiconsIcon key={i} icon={StarIcon} size={14} className="text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/65 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-xs font-bold">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Company logos strip */}
        <div className="mt-16 text-center">
          <p className="text-white/25 text-sm mb-8 uppercase tracking-widest text-xs">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-30">
            {["Stripe", "Notion", "Linear", "Vercel", "Figma", "Loom"].map((company) => (
              <span key={company} className="text-white font-bold text-lg tracking-tight">
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
