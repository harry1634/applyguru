const steps = [
  {
    step: "01",
    icon: "🔍",
    title: "Discover",
    description:
      "Search across 63,000+ listings — events, jobs, workshops, webinars, and counseling sessions — filtered to your city, skills, and interests.",
    gradient: "from-violet-500 to-purple-600",
    dotColor: "bg-violet-500",
    features: ["Smart AI filters", "Location-based search", "Skill-matched results"],
    highlight: "63,000+",
    highlightLabel: "opportunities indexed",
    accentColor: "text-violet-600",
    bgAccent: "bg-violet-50",
    borderAccent: "border-violet-100",
  },
  {
    step: "02",
    icon: "⚡",
    title: "Apply in seconds",
    description:
      "One-click registration with your saved profile. No repeated form filling. Group registration, team creation, and instant payment all supported.",
    gradient: "from-blue-500 to-cyan-500",
    dotColor: "bg-blue-500",
    features: ["Saved profile", "Team registration", "Instant payment"],
    highlight: "< 30 sec",
    highlightLabel: "average apply time",
    accentColor: "text-blue-600",
    bgAccent: "bg-blue-50",
    borderAccent: "border-blue-100",
  },
  {
    step: "03",
    icon: "🏆",
    title: "Grow & Get Rewarded",
    description:
      "Earn XP, badges, and certificates. Track volunteer hours, build your portfolio, and unlock exclusive career opportunities as you level up.",
    gradient: "from-emerald-500 to-teal-500",
    dotColor: "bg-emerald-500",
    features: ["Digital certificates", "Portfolio builder", "XP & badges"],
    highlight: "500K+",
    highlightLabel: "students already growing",
    accentColor: "text-emerald-600",
    bgAccent: "bg-emerald-50",
    borderAccent: "border-emerald-100",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Top + bottom border lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="w-full px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-3 py-1 mb-5">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Get started in{" "}
            <span className="gradient-text">3 simple steps</span>
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-base sm:text-lg">
            From discovery to certificates — in minutes, not days.
          </p>
        </div>

        {/* Steps — alternating zigzag */}
        <div className="max-w-5xl mx-auto space-y-24">
          {steps.map((step, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 150}ms` }}
              className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 animate-slide-up ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Visual side — big icon box */}
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  {/* Outer glow ring */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.gradient} opacity-15 blur-xl scale-105`} />

                  {/* Main icon card */}
                  <div className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-2xl`}>
                    {/* Inner shine */}
                    <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.25),transparent_60%)]" />

                    <span className="text-6xl sm:text-7xl drop-shadow-lg relative z-10">{step.icon}</span>

                    {/* Step badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-slate-100">
                      <span className="text-sm font-black gradient-text">{step.step}</span>
                    </div>
                  </div>

                  {/* Floating highlight badge */}
                  <div className={`absolute -bottom-4 ${i % 2 === 1 ? "-right-4 sm:-right-6" : "-left-4 sm:-left-6"} ${step.bgAccent} border ${step.borderAccent} rounded-2xl px-4 py-2.5 shadow-lg`}>
                    <p className={`text-xl font-black ${step.accentColor}`}>{step.highlight}</p>
                    <p className="text-xs text-slate-500 font-medium">{step.highlightLabel}</p>
                  </div>
                </div>
              </div>

              {/* Text side */}
              <div className="flex-1">
                {/* Step indicator */}
                <div className="flex items-center gap-2.5 mb-5">
                  <span className={`w-2.5 h-2.5 rounded-full ${step.dotColor} animate-pulse`} />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Step {step.step}
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                  {step.title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-base sm:text-lg mb-6">
                  {step.description}
                </p>

                {/* Feature chips */}
                <div className="flex flex-wrap gap-2">
                  {step.features.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full"
                    >
                      <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
