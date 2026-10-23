import Link from "next/link";

const stats = [
  { value: "50K+",  label: "Live Events" },
  { value: "500K+", label: "Active Users" },
  { value: "12K+",  label: "Job Listings" },
  { value: "98%",   label: "Satisfaction" },
];

const ticker = [
  "🎉 Rahul just registered for AI/ML Hackathon 2025",
  "💼 Priya got hired at Amazon via ApplyGuru",
  "🌱 500 volunteers joined Climate Drive today",
  "🏆 HackIndia 2025 — 3,241 registrations now live",
  "📚 340 students enrolled in Full-Stack Workshop",
  "🎯 Sneha booked a 1-on-1 career counseling session",
  "💻 New: Google Developer Workshop — 80 seats open",
  "🤝 NSS VIT Blood Donation Camp — 200 seats left",
  "🚀 Startup Summit 2025 — Early bird closes tonight",
];

const avatarColors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-pink-500"];
const avatarInitials = ["RS", "KV", "AM", "SP"];

export function Hero() {
  return (
    <>
      {/* ─── Main hero section ─── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-white">

        {/* Background image — bright coworking/students scene */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-ken-burns"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2560&q=80')",
            }}
          />
          {/* Light overlays — white heavy on left for text, lighter on right so image shows */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/60" />
          {/* Violet tint on image-showing area */}
          <div className="absolute inset-0 bg-gradient-to-l from-violet-100/30 via-transparent to-transparent" />
        </div>

        {/* Decorative gradient blobs on top of image */}
        <div className="absolute top-10 right-0 w-[480px] h-[480px] bg-violet-400/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-32 right-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-[70px] pointer-events-none" />

        {/* Content */}
        <div className="relative flex-1 flex items-center w-full px-6 sm:px-10 lg:px-16 pt-24 pb-16">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* ── Left: Text content ── */}
            <div className="animate-slide-up">

              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 text-violet-700 rounded-full px-4 py-1.5 text-xs font-bold mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                </span>
                India's #1 Student Opportunity Platform
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-[4.25rem] xl:text-[4.75rem] font-black leading-[1.0] tracking-tight text-slate-900 mb-6">
                Land Your
                <br />
                <span className="gradient-text">Dream</span>
                <br />
                Opportunity.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-500 max-w-lg mb-8 leading-relaxed">
                Events, jobs, workshops, volunteer drives, and career counseling —
                all in one platform built for India's 500,000+ ambitious students.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 justify-center px-7 py-3.5 rounded-xl gradient-brand text-white font-bold text-sm shadow-glow hover:opacity-90 hover:scale-[1.02] transition-all duration-200"
                >
                  Get Started Free
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 justify-center px-7 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all duration-200"
                >
                  Browse Events →
                </Link>
              </div>

              {/* Social proof avatars */}
              <div className="flex items-center gap-3 mb-7">
                <div className="flex -space-x-2">
                  {avatarInitials.map((initials, i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${avatarColors[i]}`}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  <span className="font-bold text-slate-800">500K+</span> students already on board
                </p>
              </div>

              {/* Search bar */}
              <div className="flex items-center gap-2 max-w-lg bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm mb-4 transition-all duration-200 hover:border-violet-300 hover:shadow-md">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  placeholder="Search events, jobs, hackathons…"
                  className="bg-transparent text-slate-800 placeholder-slate-400 text-sm flex-1 outline-none"
                />
                <Link href="/events" className="gradient-brand text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shrink-0">
                  Search
                </Link>
              </div>

              {/* Trending tags */}
              <div className="flex flex-wrap items-center gap-2 mb-10">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Trending:</span>
                {["🏆 Hackathons", "💼 Internships", "🌱 Volunteer", "🎓 AI/ML", "🏛️ Govt Jobs"].map((t) => (
                  <Link
                    key={t}
                    href="/events"
                    className="text-[11px] text-slate-600 hover:text-violet-700 bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-200 px-2.5 py-1 rounded-full transition-all duration-200 font-medium"
                  >
                    {t}
                  </Link>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-slate-200">
                {stats.map((s, i) => (
                  <div key={s.label} style={{ animationDelay: `${0.6 + i * 0.12}s` }} className="animate-slide-up">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Floating opportunity cards ── */}
            <div className="relative hidden lg:block h-[560px]">
              {/* Soft rotating decorative ring */}
              <div className="absolute inset-10 rounded-full border-2 border-dashed border-violet-200/60 animate-spin-slow pointer-events-none" />
              <div className="absolute inset-20 rounded-full border border-violet-100/50 pointer-events-none" />

              {/* Card 1 — Hackathon — top left */}
              <div
                className="absolute top-4 left-0 right-14 animate-float bg-white rounded-2xl border border-slate-100 shadow-xl p-4"
                style={{ animationDelay: "0s", transform: "rotate(-2deg)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shrink-0 shadow-md">
                    🎓
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Hackathon</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                        Live
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate">IIT Delhi Tech Hackathon</p>
                    <p className="text-xs text-slate-500">Delhi · 48 hrs · ₹2L prize pool</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5">
                      {["bg-violet-500", "bg-blue-500", "bg-pink-500"].map((c, i) => (
                        <div key={i} className={`h-5 w-5 rounded-full ${c} border-2 border-white`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500">3,241 registered</span>
                  </div>
                  <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                    600 spots left
                  </span>
                </div>
              </div>

              {/* Card 2 — Internship — middle right */}
              <div
                className="absolute left-14 right-0 animate-float bg-white rounded-2xl border border-slate-100 shadow-xl p-4"
                style={{ top: "38%", animationDelay: "0.9s", transform: "rotate(1.5deg)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xl shrink-0 shadow-md">
                    💼
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Internship</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate">Amazon SDE Internship</p>
                    <p className="text-xs text-slate-500">Remote · ₹80K/mo · Summer 2025</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5">
                      {["bg-cyan-500", "bg-blue-500", "bg-indigo-500"].map((c, i) => (
                        <div key={i} className={`h-5 w-5 rounded-full ${c} border-2 border-white`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500">847 applicants</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    5 openings
                  </span>
                </div>
              </div>

              {/* Card 3 — Volunteer — bottom */}
              <div
                className="absolute bottom-8 left-6 right-6 animate-float bg-white rounded-2xl border border-slate-100 shadow-xl p-4"
                style={{ animationDelay: "1.7s", transform: "rotate(-1deg)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl shrink-0 shadow-md">
                    🌱
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Volunteer</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate">Climate Action Drive — Mumbai</p>
                    <p className="text-xs text-slate-500">NSS India · Jun 15 · Free entry</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5">
                      {["bg-emerald-500", "bg-teal-500", "bg-green-500"].map((c, i) => (
                        <div key={i} className={`h-5 w-5 rounded-full ${c} border-2 border-white`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500">1,200 joined</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    300 spots left
                  </span>
                </div>
              </div>

              {/* AI Match badge — floating */}
              <div
                className="absolute animate-float bg-white rounded-xl border border-slate-100 shadow-lg px-3 py-2"
                style={{ top: "22%", right: "4px", animationDelay: "0.5s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-800 leading-none mb-0.5">AI-Matched for you</p>
                    <p className="text-[9px] text-slate-500">12 new listings today</p>
                  </div>
                </div>
              </div>

              {/* Decorative floating dots */}
              <div className="absolute top-16 right-28 w-3 h-3 bg-violet-400 rounded-full animate-float-dot" style={{ animationDelay: "0.3s" }} />
              <div className="absolute top-1/2 left-2 w-2 h-2 bg-blue-400 rounded-full animate-float-dot" style={{ animationDelay: "1.1s" }} />
              <div className="absolute bottom-24 right-10 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-float-dot" style={{ animationDelay: "0.8s" }} />
              <div className="absolute top-3/4 left-20 w-2 h-2 bg-pink-400 rounded-full animate-float-dot" style={{ animationDelay: "1.5s" }} />
            </div>

          </div>
        </div>

        {/* Bottom metadata strip */}
        <div className="relative w-full border-t border-slate-100 bg-white/60 backdrop-blur-sm">
          <div className="w-full px-6 sm:px-10 lg:px-16 py-3.5 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold tracking-[0.2em] uppercase">
              Est. 2024
            </span>
            <span className="text-[11px] text-slate-400 font-semibold tracking-[0.15em] uppercase hidden sm:block">
              Events &nbsp;·&nbsp; Jobs &nbsp;·&nbsp; Volunteering &nbsp;·&nbsp; Workshops &nbsp;·&nbsp; Webinars
            </span>
          </div>
        </div>
      </section>

      {/* ─── Live activity ticker ─── */}
      <div className="bg-slate-900 border-b border-white/8 py-3 overflow-hidden flex items-center gap-0">
        <div className="shrink-0 flex items-center gap-1.5 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 ml-6 mr-4 rounded-md z-10">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
          Live
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...ticker, ...ticker].map((item, i) => (
              <span key={i} className="text-sm text-slate-300 shrink-0 font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
