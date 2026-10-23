"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const domains = ["All", "Tech", "Design", "Business", "Soft Skills", "Language", "Career", "Creative"];
const levels  = ["All", "Beginner", "Intermediate", "Advanced"];
const modes   = ["All", "Online", "Offline", "Hybrid"];

const workshops = [
  { id:"w1", emoji:"🤖", title:"AI & Machine Learning Bootcamp", instructor:"Dr. Amit Kumar", org:"IIT Bombay Online", duration:"30 days", level:"Intermediate", mode:"Online",  price:4999,  rating:4.9, reviews:820,  seats:50,  tags:["AI","ML","Python","Deep Learning"],      gradient:"from-purple-600 to-blue-600",     badge:"🔥 Bestseller" },
  { id:"w2", emoji:"🎨", title:"UI/UX Design Fundamentals",      instructor:"Neha Joshi",   org:"Designo Labs",    duration:"14 days", level:"Beginner",      mode:"Online",  price:1499,  rating:4.8, reviews:430,  seats:30,  tags:["Figma","UI/UX","Prototyping"],          gradient:"from-pink-500 to-rose-600",       badge:"New" },
  { id:"w3", emoji:"💻", title:"Full-Stack Next.js Development", instructor:"Rohan Mehta",  org:"TechMentor",      duration:"21 days", level:"Intermediate", mode:"Online",  price:2999,  rating:4.9, reviews:1200, seats:100, tags:["Next.js","React","Node.js","Supabase"], gradient:"from-emerald-500 to-teal-600",    badge:"🔥 Bestseller" },
  { id:"w4", emoji:"📊", title:"Data Analytics with Python",    instructor:"Sanya Gupta",  org:"DataFirst",       duration:"7 days",  level:"Beginner",      mode:"Online",  price:999,   rating:4.7, reviews:650,  seats:200, tags:["Python","Pandas","SQL","Excel"],        gradient:"from-orange-500 to-amber-500",    badge:"" },
  { id:"w5", emoji:"🎤", title:"Public Speaking Masterclass",   instructor:"Vikram Nair",  org:"Toastmasters",    duration:"2 days",  level:"All Levels",    mode:"Offline", price:1999,  rating:4.8, reviews:310,  seats:40,  tags:["Communication","Leadership","Soft Skills"], gradient:"from-blue-500 to-cyan-500",     badge:"New" },
  { id:"w6", emoji:"🔐", title:"Ethical Hacking & CyberSecurity",instructor:"Raj Sharma",  org:"SecureIT",        duration:"10 days", level:"Advanced",      mode:"Online",  price:3499,  rating:4.8, reviews:540,  seats:25,  tags:["Cybersecurity","Ethical Hacking"],      gradient:"from-slate-700 to-slate-900",    badge:"" },
  { id:"w7", emoji:"📱", title:"React Native Mobile App Dev",   instructor:"Priya Singh",  org:"MobileDev India", duration:"21 days", level:"Intermediate", mode:"Online",  price:2499,  rating:4.6, reviews:280,  seats:60,  tags:["React Native","iOS","Android"],         gradient:"from-indigo-500 to-purple-600",   badge:"" },
  { id:"w8", emoji:"💼", title:"Entrepreneurship & Startup",    instructor:"Ankit Jain",   org:"StartupIndia",    duration:"5 days",  level:"All Levels",    mode:"Hybrid",  price:0,     rating:4.7, reviews:890,  seats:500, tags:["Startups","Business","Funding"],        gradient:"from-yellow-500 to-orange-500",   badge:"Free" },
];

export default function WorkshopsPage() {
  const [search, setSearch]   = useState("");
  const [domain, setDomain]   = useState("All");
  const [level, setLevel]     = useState("All");
  const [mode, setMode]       = useState("All");

  const filtered = workshops.filter((w) => {
    const matchDomain = domain === "All" || w.tags.some((t) => t.toLowerCase().includes(domain.toLowerCase()));
    const matchLevel  = level  === "All" || w.level === level || w.level === "All Levels";
    const matchMode   = mode   === "All" || w.mode  === mode;
    const matchSearch = !search || w.title.toLowerCase().includes(search.toLowerCase()) || w.instructor.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchLevel && matchMode && matchSearch;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Workshops</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-0.5">Skill-building sessions from top instructors</p>
      </div>

      <Input type="search" placeholder="Search workshops, instructors…" value={search} onChange={(e) => setSearch(e.target.value)}
        leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
      />

      {/* Domain filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {domains.map((d) => (
          <button key={d} onClick={() => setDomain(d)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${domain === d ? "gradient-brand text-white shadow-sm" : "bg-[var(--card)] border border-[var(--border)] hover:border-brand-400"}`}>
            {d}
          </button>
        ))}
      </div>

      {/* Level + Mode filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1">
          <span className="text-xs text-[var(--muted-foreground)] self-center mr-1">Level:</span>
          {levels.map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${level === l ? "bg-slate-900 text-white" : "bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--muted)]"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <span className="text-xs text-[var(--muted-foreground)] self-center mr-1">Mode:</span>
          {modes.map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${mode === m ? "bg-slate-900 text-white" : "bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--muted)]"}`}>
              {m}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-[var(--muted-foreground)]"><strong className="text-[var(--foreground)]">{filtered.length}</strong> workshops</span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((w, i) => (
          <Link key={w.id} href={`/workshops/${w.id}`}
            style={{ animationDelay:`${i * 60}ms` }}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card hover-lift overflow-hidden flex flex-col animate-slide-up">

            <div className={`h-28 bg-gradient-to-br ${w.gradient} relative flex items-center justify-center`}>
              <span className="text-5xl group-hover:scale-110 transition-transform">{w.emoji}</span>
              {w.badge && (
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/90 text-slate-800 px-2 py-0.5 rounded-full">{w.badge}</span>
              )}
              <span className="absolute top-3 right-3 text-xs font-bold text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                {w.price === 0 ? "Free" : `₹${w.price.toLocaleString("en-IN")}`}
              </span>
            </div>

            <div className="flex flex-col flex-1 p-4">
              <h3 className="font-semibold text-sm text-[var(--foreground)] line-clamp-2 mb-2 group-hover:text-[var(--primary)] transition-colors">{w.title}</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">by {w.instructor}</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">{w.org} · {w.duration}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="outline" size="sm">{w.level}</Badge>
                <Badge variant={w.mode === "Online" ? "success" : w.mode === "Offline" ? "info" : "warning"} size="sm">{w.mode}</Badge>
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">★</span>
                  <span className="text-xs font-bold">{w.rating}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">({w.reviews})</span>
                </div>
                <span className="text-xs text-red-500 font-medium">{w.seats} seats left</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
