const stats = [
  { value: "500+", label: "Companies Trust Us", sublabel: "From startups to Fortune 500" },
  { value: "50K+", label: "Screening Calls Made", sublabel: "Every month, growing fast" },
  { value: "85%", label: "Time Saved", sublabel: "Vs. manual phone screens" },
  { value: "4.9★", label: "Average Rating", sublabel: "From 1,200+ reviews" },
];

export default function Stats() {
  return (
    <section className="py-16 bg-[#05050f] border-y border-white/5 relative overflow-hidden">
      {/* Subtle gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center group">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-white font-semibold text-sm sm:text-base mb-1">{stat.label}</div>
              <div className="text-white/35 text-xs sm:text-sm">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
