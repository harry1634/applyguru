import Link from "next/link";

const categories = [
  { label: "Volunteer Events",      href: "/events?category=volunteer" },
  { label: "College Events",        href: "/events?category=college" },
  { label: "Workshops",             href: "/workshops" },
  { label: "Webinars",              href: "/webinars" },
  { label: "Summits",               href: "/summits" },
  { label: "Jobs & Internships",    href: "/jobs" },
  { label: "Career Guidance",       href: "/counseling" },
  { label: "Educational Programs",  href: "/courses" },
];

const company = [
  { label: "About Us",    href: "/about" },
  { label: "Careers",     href: "/careers" },
  { label: "Press",       href: "/press" },
  { label: "Blog",        href: "/blog" },
  { label: "Partners",    href: "/partners" },
  { label: "Contact",     href: "/contact" },
];

const organizers = [
  { label: "Post an Event",      href: "/organizers/create" },
  { label: "Post a Job",         href: "/organizers/jobs/create" },
  { label: "Organizer Dashboard", href: "/organizers/dashboard" },
  { label: "Pricing",            href: "/pricing" },
  { label: "Verification",       href: "/organizers/verify" },
];

const legal = [
  { label: "Privacy Policy",  href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy",   href: "/cookies" },
  { label: "GDPR",            href: "/gdpr" },
];

const socials = [
  {
    label: "Twitter",
    href: "https://twitter.com/applyguru",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/applyguru",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/applyguru",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@applyguru",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AG</span>
              </div>
              <span className="font-bold text-lg text-white">
                <span className="gradient-text">Apply</span>Guru
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              India&apos;s largest discovery platform for events, jobs, workshops, and career opportunities.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {categories.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">For Organizers</h4>
            <ul className="space-y-2.5">
              {organizers.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              {company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ApplyGuru Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {legal.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-slate-500 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* App badges */}
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <p className="text-xs text-slate-600">Available on:</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-3 py-1.5">
              <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span className="text-xs text-slate-300 font-medium">App Store</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-3 py-1.5">
              <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.18 23.76c.35.19.75.19 1.13-.02l11.67-6.62-2.46-2.47-10.34 9.11zm-1.1-20.87C2.02 3.15 2 3.45 2 3.77v16.46c0 .32.02.62.08.89l.06.06 9.22-9.22v-.22L2.08 2.83l-.0.06zm15.26 8.98l-2.96-1.68-2.75 2.76 2.75 2.76 2.98-1.7c.85-.48.85-1.66-.02-2.14zm-13.76 9.05L14.8 14.9l-2.46-2.47L2.36 20.9c.37.22.79.24 1.22.02z" />
              </svg>
              <span className="text-xs text-slate-300 font-medium">Google Play</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
