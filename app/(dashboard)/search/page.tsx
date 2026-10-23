"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const categories = [
  { label:"Events",          icon:"🎉", href:"/events",      count:"50K+" },
  { label:"Jobs",            icon:"💼", href:"/jobs",        count:"18K+" },
  { label:"Workshops",       icon:"🔧", href:"/workshops",   count:"2K+"  },
  { label:"Webinars",        icon:"📹", href:"/webinars",    count:"800+" },
  { label:"Courses",         icon:"📚", href:"/courses",     count:"1.2K+"},
  { label:"Summits",         icon:"🏢", href:"/summits",     count:"200+" },
  { label:"Career Guidance", icon:"🎯", href:"/counseling",  count:"500+" },
];

const trending = [
  "React Developer Jobs", "Hackathon 2025", "ML Engineer Internship",
  "NSS Volunteer Events", "Product Manager", "Data Science Course",
  "IIT Bombay Events", "Startup Pitch Competition",
];

const allResults = [
  { type:"Event",    icon:"🏆", title:"National Entrepreneurship Summit 2025", meta:"Mar 15 · IIT Bombay · Free",       href:"/events/1" },
  { type:"Job",      icon:"🔵", title:"Software Engineer Intern at Google",    meta:"Bangalore · ₹80K/mo · Internship", href:"/jobs" },
  { type:"Workshop", icon:"🤖", title:"AI & Machine Learning Bootcamp",        meta:"30 days · Online · ₹4,999",        href:"/workshops/w1" },
  { type:"Webinar",  icon:"💼", title:"Ace Your Next Job Interview",           meta:"Today · Live · Free",              href:"/webinars/wb4" },
  { type:"Course",   icon:"⚛️", title:"React & Next.js — Build Production Apps", meta:"6 weeks · Online · ₹2,999",  href:"/courses" },
  { type:"Summit",   icon:"🚀", title:"Startup India Grand Conclave 2025",     meta:"May 15 · Delhi · ₹999",           href:"/summits" },
];

const typeColor: Record<string, string> = {
  Event:    "bg-violet-100 text-violet-700",
  Job:      "bg-blue-100 text-blue-700",
  Workshop: "bg-orange-100 text-orange-700",
  Webinar:  "bg-purple-100 text-purple-700",
  Course:   "bg-emerald-100 text-emerald-700",
  Summit:   "bg-amber-100 text-amber-700",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = query.length >= 2
    ? allResults.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()) || r.type.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Search ApplyGuru</h1>
        <p className="text-[var(--muted-foreground)] text-sm">Find events, jobs, workshops, courses and more</p>
      </div>

      <Input
        type="search"
        placeholder="Search for events, jobs, workshops…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
      />

      {query.length >= 2 ? (
        <div className="space-y-2">
          <p className="text-xs text-[var(--muted-foreground)] font-medium">{results.length} results for &quot;{query}&quot;</p>
          {results.length > 0 ? results.map((r, i) => (
            <Link key={i} href={r.href}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] hover:border-[var(--primary)] transition-all group">
              <span className="text-2xl shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] truncate">{r.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{r.meta}</p>
              </div>
              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor[r.type]}`}>{r.type}</span>
            </Link>
          )) : (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">🔍</p>
              <p className="font-medium text-[var(--foreground)]">No results found</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Try different keywords or browse by category</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Browse categories */}
          <div>
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Browse by Category</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <Link key={cat.label} href={cat.href}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] hover:border-[var(--primary)] transition-all group">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">{cat.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{cat.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending searches */}
          <div>
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">🔥 Trending Searches</p>
            <div className="flex flex-wrap gap-2">
              {trending.map((t) => (
                <button key={t} onClick={() => setQuery(t)}
                  className="px-3 py-1.5 rounded-full text-sm border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all bg-[var(--card)]">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
