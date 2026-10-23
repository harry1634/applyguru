"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  {
    label: "Browse",
    href: "#",
    children: [
      { label: "Volunteer Events",      href: "/events?category=volunteer",  icon: "🤝", desc: "Make a difference" },
      { label: "College Events",        href: "/events?category=college",    icon: "🎓", desc: "Fests, hackathons & more" },
      { label: "Workshops",             href: "/workshops",                  icon: "🔧", desc: "Skill-building sessions" },
      { label: "Webinars",              href: "/webinars",                   icon: "📹", desc: "Learn from experts" },
      { label: "Summits & Conferences", href: "/summits",                    icon: "🏢", desc: "Industry gatherings" },
      { label: "Jobs & Internships",    href: "/jobs",                       icon: "💼", desc: "Career opportunities" },
      { label: "Career Guidance",       href: "/counseling",                 icon: "🎯", desc: "1-on-1 mentorship" },
      { label: "Educational Programs",  href: "/courses",                    icon: "📚", desc: "Courses & bootcamps" },
    ],
  },
  { label: "For Organizers", href: "/organizers" },
  { label: "Pricing",        href: "/pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-[var(--border)]"
            : "bg-white/60 backdrop-blur-md border-b border-slate-200/70"
        )}
      >
        <nav className="w-full px-6 sm:px-10 lg:px-16 h-12 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-sm">AG</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="gradient-text">Apply</span>
              <span className="text-[var(--foreground)]">Guru</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    scrolled
                      ? "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                      : "text-slate-700 hover:text-[var(--primary)] hover:bg-slate-100/70"
                  )}>
                    {link.label}
                    <svg className={cn("w-3.5 h-3.5 transition-transform", activeDropdown === link.label && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === link.label && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-slide-down">
                      <div className="bg-white rounded-2xl shadow-xl border border-[var(--border)] p-3 w-[520px] grid grid-cols-2 gap-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--muted)] transition-colors group"
                          >
                            <span className="text-xl">{child.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)]">
                                {child.label}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)]">{child.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    scrolled
                      ? "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                      : "text-slate-700 hover:text-[var(--primary)] hover:bg-slate-100/70"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button variant="gradient" size="sm" asChild>
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn("md:hidden p-2 rounded-lg transition-colors text-slate-700 hover:bg-slate-100")}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col md:hidden animate-fade-in">
          <div className="h-12 shrink-0" />
          <div className="flex-1 bg-white overflow-y-auto p-4 space-y-1">
            <div className="pb-4 border-b border-[var(--border)] mb-4">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Browse</p>
              {navLinks[0].children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--muted)] transition-colors"
                >
                  <span className="text-lg">{child.icon}</span>
                  <span className="text-sm font-medium">{child.label}</span>
                </Link>
              ))}
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block p-3 text-sm font-medium rounded-xl hover:bg-[var(--muted)] transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-[var(--border)] grid grid-cols-2 gap-3">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
              </Button>
              <Button variant="gradient" asChild className="w-full">
                <Link href="/signup" onClick={() => setMobileOpen(false)}>Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
