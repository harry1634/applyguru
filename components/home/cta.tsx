import Link from "next/link";
import { Button } from "@/components/ui/button";

const perks = [
  "Free forever plan",
  "No credit card required",
  "AI-powered recommendations",
  "Certificate tracking & portfolio",
  "Cancel anytime",
  "Instant access to 63K+ opportunities",
];

const statBars = [
  { label: "Events & Hackathons", value: "50K+",  pct: 85, color: "from-violet-500 to-purple-600" },
  { label: "Jobs & Internships",  value: "18K+",  pct: 68, color: "from-cyan-500 to-blue-500" },
  { label: "Workshops & Webinars",value: "11K+",  pct: 52, color: "from-orange-500 to-amber-500" },
  { label: "Active Students",     value: "500K+", pct: 100, color: "from-emerald-500 to-teal-500" },
];

const recentActivity = [
  { text: "Anjali registered for IIT Delhi Hackathon 2025", time: "2m ago" },
  { text: "Rahul got shortlisted for Amazon SDE Internship", time: "8m ago" },
  { text: "200 students joined Climate Action Volunteer Drive", time: "14m ago" },
];

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#07040f]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-[#07040f] to-blue-950/40" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow orbs */}
      <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── Left: Text & CTA ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-4 py-1.5 text-xs font-semibold mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Join 500,000+ students today
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to unlock your
              <br />
              <span className="gradient-text-animated">next big opportunity?</span>
            </h2>

            <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed">
              Create your free account in under 60 seconds and instantly access
              thousands of events, jobs, and growth opportunities.
            </p>

            {/* Perks checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-10">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {perk}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-violet-700 hover:bg-blue-50 font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
                asChild
              >
                <Link href="/signup">
                  Create free account
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:scale-105 hover:border-white/60 transition-all duration-300"
                asChild
              >
                <Link href="/organizers">Post an event</Link>
              </Button>
            </div>

            <p className="mt-6 text-slate-600 text-xs">
              Trusted by students from{" "}
              <strong className="text-slate-400">IIT, NIT, VIT, DTU, BITS</strong> and 2,000+ colleges
            </p>
          </div>

          {/* ── Right: Live stats dashboard ── */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute inset-0 bg-violet-500/5 rounded-3xl blur-2xl scale-105 -z-10" />

            <div className="rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-sm p-7 relative overflow-hidden">
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full pointer-events-none bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-white font-bold text-sm tracking-tight">Platform Overview</p>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">Live</span>
                </div>
              </div>

              {/* Stat bars */}
              <div className="space-y-4 mb-7">
                {statBars.map((s, i) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400">{s.label}</span>
                      <span className="text-sm font-bold text-white">{s.value}</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${s.color} rounded-full`}
                        style={{ width: `${s.pct}%`, animation: `bar-fill 1.2s ${i * 0.15}s ease-out both` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-white/8 mb-5" />

              {/* Recent activity */}
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-3">
                Recent Activity
              </p>
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0 animate-pulse" />
                    <p className="text-xs text-slate-400 flex-1 leading-relaxed">{a.text}</p>
                    <span className="text-[10px] text-slate-600 shrink-0 font-medium">{a.time}</span>
                  </div>
                ))}
              </div>

              {/* Footer strip */}
              <div className="mt-6 pt-5 border-t border-white/8 flex items-center justify-between">
                <span className="text-xs text-slate-600">Updated in real-time</span>
                <span className="text-xs font-semibold text-violet-400">applyguru.in →</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
