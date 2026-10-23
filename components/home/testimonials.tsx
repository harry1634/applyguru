const testimonials = [
  {
    name: "Riya Sharma",
    role: "CS Student, VIT Vellore",
    avatar: "RS",
    gradient: "from-violet-500 to-purple-600",
    content:
      "Found my dream internship at a startup through ApplyGuru. The AI-powered recommendations are scary accurate — it showed me a ₹40K/month remote role perfectly matching my React skills within 10 minutes of signing up.",
    stars: 5,
    tag: "💼 Got Hired",
    tagColor: "bg-violet-500/10 text-violet-600 border-violet-200",
    featured: true,
  },
  {
    name: "Arjun Mehta",
    role: "Volunteer Coordinator, NSS",
    avatar: "AM",
    gradient: "from-emerald-500 to-teal-500",
    content:
      "Organized our college's annual blood donation camp through ApplyGuru. QR check-in and automatic certificate generation saved us 8+ hours of manual work. 340 students registered effortlessly.",
    stars: 5,
    tag: "🤝 Organized 2 Events",
    tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  },
  {
    name: "Sneha Patel",
    role: "Product Manager, TCS",
    avatar: "SP",
    gradient: "from-pink-500 to-rose-500",
    content:
      "The 1-on-1 career counseling session was game-changing. My counselor helped me pivot from engineering to product management and even reviewed my PM resume. Worth every rupee.",
    stars: 5,
    tag: "🎯 Career Pivot",
    tagColor: "bg-pink-500/10 text-pink-600 border-pink-200",
  },
  {
    name: "Karan Verma",
    role: "B.Tech 3rd Year, DTU",
    avatar: "KV",
    gradient: "from-blue-500 to-cyan-500",
    content:
      "Participated in 6 hackathons, 2 workshops, and 3 webinars all discovered here. The gamification keeps me coming back — I'm a Gold member with 1,200 XP. My resume looks incredible now.",
    stars: 5,
    tag: "🏆 Gold Member",
    tagColor: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  {
    name: "Priya Nair",
    role: "HR Manager, Infosys",
    avatar: "PN",
    gradient: "from-orange-500 to-amber-500",
    content:
      "We post all our campus hiring drives on ApplyGuru. The applicant quality is significantly better for fresher roles — students come with verified certificates and portfolios.",
    stars: 5,
    tag: "🏢 Employer",
    tagColor: "bg-orange-500/10 text-orange-600 border-orange-200",
  },
  {
    name: "Dhruv Joshi",
    role: "UPSC Aspirant, Mumbai",
    avatar: "DJ",
    gradient: "from-indigo-500 to-violet-500",
    content:
      "The government jobs section is the best I've used. Instant notifications for SSC, UPSC, banking exams with organized syllabus and important dates. Saved to my home screen.",
    stars: 5,
    tag: "📋 Gov Jobs",
    tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const featured = testimonials[0];
  const rest = testimonials.slice(1);

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="w-full px-6 sm:px-10 lg:px-16">

        {/* Header — left-aligned for variety */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3">
              12,800+ reviews
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Real stories,{" "}
              <span className="gradient-text">real results</span>
            </h2>
          </div>
          {/* Rating chip */}
          <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-card shrink-0 self-start sm:self-auto">
            <div className="text-center">
              <p className="text-3xl font-black gradient-text leading-none">4.9</p>
              <Stars count={5} />
            </div>
            <div className="w-px h-10 bg-slate-100" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800">12,800+ reviews</p>
              <p className="text-xs text-slate-400">98% recommend</p>
            </div>
          </div>
        </div>

        {/* Featured testimonial — full-width gradient card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-blue-700 p-8 sm:p-10 mb-6 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white, transparent 50%), radial-gradient(circle at 80% 20%, white, transparent 40%)"
          }} />
          {/* Large quote mark */}
          <div className="absolute top-6 right-8 text-[120px] font-serif leading-none text-white/10 select-none pointer-events-none">"</div>

          <div className="relative flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <span className={`inline-flex items-center self-start text-xs font-semibold rounded-full px-2.5 py-1 mb-5 border bg-white/15 text-white border-white/25`}>
                {featured.tag}
              </span>
              <Stars count={featured.stars} />
              <p className="text-white text-lg sm:text-xl font-medium leading-relaxed mt-4 mb-6">
                &ldquo;{featured.content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                  {featured.avatar}
                </div>
                <div>
                  <p className="font-bold text-white">{featured.name}</p>
                  <p className="text-sm text-white/65">{featured.role}</p>
                </div>
              </div>
            </div>

            {/* Side stat */}
            <div className="shrink-0 grid grid-cols-2 md:grid-cols-1 gap-3 md:w-40">
              {[
                { value: "6 Hackathons", label: "participated" },
                { value: "3 Offers", label: "received" },
                { value: "₹40K/mo", label: "internship salary" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 border border-white/15 rounded-2xl p-3 text-center backdrop-blur-sm">
                  <p className="font-bold text-white text-sm">{s.value}</p>
                  <p className="text-[10px] text-white/55 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rest of testimonials — 5-col grid (2+3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {rest.map((t, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 70}ms` }}
              className={`group bg-white rounded-2xl border border-slate-100 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 animate-slide-up flex flex-col ${
                i < 2 ? "xl:col-span-1" : "xl:col-span-1"
              }`}
            >
              {/* Tag */}
              <span className={`inline-flex items-center self-start text-[10px] font-bold rounded-full px-2.5 py-0.5 mb-3 border ${t.tagColor}`}>
                {t.tag}
              </span>

              <Stars count={t.stars} />

              {/* Quote */}
              <p className="text-xs text-slate-600 leading-relaxed mt-3 mb-4 flex-1 line-clamp-3">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{t.name}</p>
                  <p className="text-[10px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
