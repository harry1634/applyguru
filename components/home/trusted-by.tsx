const colleges = [
  "IIT Delhi", "IIT Bombay", "NIT Trichy", "VIT Vellore",
  "DTU Delhi", "BITS Pilani", "NSIT Delhi", "Anna University",
  "IIT Madras", "Manipal MIT", "SRM University", "Amity University",
  "IIT Roorkee", "Jadavpur Univ.", "IIIT Hyderabad", "Christ University",
];

const companies = [
  "Google", "Amazon", "Microsoft", "Flipkart",
  "Infosys", "TCS", "Wipro", "Swiggy",
  "Zomato", "Razorpay", "Zerodha", "BYJU'S",
];

export function TrustedBy() {
  return (
    <section className="py-14 bg-slate-50 border-y border-slate-100 overflow-hidden">
      <div className="w-full px-6 sm:px-10 lg:px-16 mb-8 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">
          Trusted by students from 2,000+ colleges &amp; top companies hiring here
        </p>
      </div>

      {/* Colleges row */}
      <div className="relative mb-4 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...colleges, ...colleges].map((name, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm"
            >
              <span className="text-base">🎓</span>
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Companies row (reverse direction) */}
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="flex gap-8 animate-marquee-reverse whitespace-nowrap">
          {[...companies, ...companies].map((name, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm"
            >
              <span className="text-base">🏢</span>
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
