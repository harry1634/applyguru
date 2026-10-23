import Link from "next/link";

const categories = [
  {
    icon: "💼",
    label: "Jobs & Internships",
    description: "Full-time, part-time, remote & government job openings for every skill level",
    count: "18,700+",
    href: "/jobs",
    gradient: "from-cyan-500 to-blue-500",
    accentColor: "text-cyan-400",
    accentBg: "bg-cyan-400/10 border-cyan-400/20",
    featured: true,
  },
  {
    icon: "🎓",
    label: "College Events",
    description: "Hackathons, cultural fests, tech events & competitions",
    count: "12,500+",
    href: "/events?category=college",
    gradient: "from-blue-500 to-indigo-600",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-400/10 border-blue-400/20",
  },
  {
    icon: "🤝",
    label: "Volunteer Events",
    description: "Blood camps, plantation drives, food distribution & more",
    count: "8,200+",
    href: "/events?category=volunteer",
    gradient: "from-emerald-500 to-teal-500",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    icon: "📚",
    label: "Educational Programs",
    description: "Online courses, bootcamps, certifications & degrees",
    count: "9,600+",
    href: "/courses",
    gradient: "from-yellow-500 to-orange-500",
    accentColor: "text-amber-400",
    accentBg: "bg-amber-400/10 border-amber-400/20",
  },
  {
    icon: "🔧",
    label: "Workshops",
    description: "AI/ML, web dev, design, business & soft skills",
    count: "4,800+",
    href: "/workshops",
    gradient: "from-orange-500 to-amber-500",
    accentColor: "text-orange-400",
    accentBg: "bg-orange-400/10 border-orange-400/20",
  },
  {
    icon: "📹",
    label: "Webinars",
    description: "Career talks, expert sessions & panel discussions",
    count: "6,300+",
    href: "/webinars",
    gradient: "from-purple-500 to-violet-600",
    accentColor: "text-purple-400",
    accentBg: "bg-purple-400/10 border-purple-400/20",
  },
  {
    icon: "🏢",
    label: "Summits & Conferences",
    description: "Tech conferences, startup summits & industry gatherings",
    count: "1,400+",
    href: "/summits",
    gradient: "from-indigo-500 to-blue-600",
    accentColor: "text-indigo-400",
    accentBg: "bg-indigo-400/10 border-indigo-400/20",
  },
  {
    icon: "🎯",
    label: "Career Guidance",
    description: "1-on-1 counseling, mock interviews & resume reviews",
    count: "2,100+",
    href: "/counseling",
    gradient: "from-pink-500 to-rose-500",
    accentColor: "text-pink-400",
    accentBg: "bg-pink-400/10 border-pink-400/20",
  },
];

export function Categories() {
  const [featured, ...rest] = categories;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle top gradient transition from dark ticker */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-blue-500 to-emerald-500" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-white pointer-events-none" />

      <div className="relative w-full px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3">
              8 Categories
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Everything in{" "}
              <span className="gradient-text">one place</span>
            </h2>
          </div>
          <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
            From hackathons to government jobs — discover every opportunity type in one platform
          </p>
        </div>

        {/* Grid — featured card spans 2 cols on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Featured card */}
          <Link
            href={featured.href}
            className="lg:col-span-2 group relative rounded-2xl border border-slate-100 bg-white overflow-hidden hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up shadow-card"
          >
            {/* Shimmer sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none z-10" />

            <div className="relative p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br ${featured.gradient} flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                {featured.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{featured.label}</h3>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${featured.accentBg} ${featured.accentColor}`}>
                    {featured.count}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Featured</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{featured.description}</p>
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${featured.accentColor} group-hover:gap-3 transition-all duration-200`}>
                  Explore opportunities
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${featured.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </Link>

          {/* Regular cards */}
          {rest.map((cat, i) => (
            <Link
              key={cat.href}
              href={cat.href}
              style={{ animationDelay: `${(i + 1) * 60}ms` }}
              className="group relative rounded-2xl border border-slate-100 bg-white overflow-hidden hover:border-transparent hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-slide-up shadow-card"
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none z-10" />
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                  {cat.count}
                </span>
              </div>
              <div className="relative p-5">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  {cat.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1.5 group-hover:text-[var(--primary)] transition-colors">{cat.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">{cat.description}</p>
                <span className={`text-xs font-semibold ${cat.accentColor} flex items-center gap-1 group-hover:gap-2 transition-all duration-200`}>
                  Explore
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
