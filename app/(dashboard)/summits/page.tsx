"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const domains = ["All", "Technology", "Business", "Healthcare", "Education", "Sustainability", "Finance"];

const summits = [
  { id:"s1", emoji:"🌐", title:"India Tech Summit 2025",               organizer:"CII",                 date:"Mar 15–16, 2025", location:"Pragati Maidan, Delhi", mode:"Offline", price:1999,  seats:5000,  registered:4200, domain:"Technology",    gradient:"from-blue-600 to-violet-600",  badge:"🔥 Featured", speakers:["Sundar Pichai (Keynote)","Ratan Tata","Nandan Nilekani"] },
  { id:"s2", emoji:"🌱", title:"Sustainability & Green Future Summit",  organizer:"FICCI",               date:"Mar 22, 2025",    location:"ITC Grand, Bengaluru",   mode:"Hybrid",  price:0,     seats:3000,  registered:1800, domain:"Sustainability", gradient:"from-emerald-500 to-green-600", badge:"Free",        speakers:["Amitabh Kant","Rajiv Kumar"] },
  { id:"s3", emoji:"💰", title:"FinTech India Summit 2025",            organizer:"NASSCOM",             date:"Apr 5–6, 2025",   location:"BKC, Mumbai",            mode:"Offline", price:2999,  seats:2000,  registered:1650, domain:"Finance",       gradient:"from-amber-500 to-orange-600", badge:"",            speakers:["RBI Governor","Paytm Founders","Zerodha CEO"] },
  { id:"s4", emoji:"🏥", title:"HealthTech & MedInnovate 2025",        organizer:"CII Healthcare",      date:"Apr 18, 2025",    location:"Hyderabad International", mode:"Offline", price:1499,  seats:1500,  registered:820,  domain:"Healthcare",    gradient:"from-rose-500 to-pink-600",   badge:"New",         speakers:["AIIMS Director","HealthKart CEO"] },
  { id:"s5", emoji:"🎓", title:"EdTech & Future of Learning Summit",   organizer:"Govt. of India",      date:"May 2, 2025",     location:"Virtual",                mode:"Online",  price:0,     seats:50000, registered:18000,domain:"Education",     gradient:"from-purple-500 to-indigo-600",badge:"Free",        speakers:["Education Minister","BYJU'S","Unacademy Leaders"] },
  { id:"s6", emoji:"🚀", title:"Startup India Grand Conclave 2025",    organizer:"DPIIT",               date:"May 15–16, 2025", location:"Aerocity, Delhi",        mode:"Offline", price:999,   seats:8000,  registered:5600, domain:"Business",      gradient:"from-cyan-500 to-blue-600",   badge:"🔥 Featured", speakers:["PM Modi (virtual)","200+ VCs","500+ Startups"] },
];

export default function SummitsPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");

  const filtered = summits.filter((s) => {
    const matchDomain = domain     === "All" || s.domain === domain;
    const matchMode   = modeFilter === "All" || s.mode   === modeFilter;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.organizer.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchMode && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="rounded-2xl gradient-brand p-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 mesh-hero opacity-20" />
        <div className="relative">
          <h1 className="text-2xl font-bold mb-2">Summits & Conferences</h1>
          <p className="text-blue-100 text-sm mb-4">Network with industry leaders at India&apos;s top conferences</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="bg-white/15 rounded-xl px-4 py-2">🎤 200+ Speakers</div>
            <div className="bg-white/15 rounded-xl px-4 py-2">🤝 Networking Sessions</div>
            <div className="bg-white/15 rounded-xl px-4 py-2">📜 Participation Certificates</div>
          </div>
        </div>
      </div>

      <Input type="search" placeholder="Search summits, organizers…" value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {domains.map((d) => (
          <button key={d} onClick={() => setDomain(d)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-all ${domain === d ? "gradient-brand text-white shadow-sm" : "bg-[var(--card)] border border-[var(--border)] hover:border-brand-400"}`}>
            {d}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted-foreground)]">Mode:</span>
        {["All","Online","Offline","Hybrid"].map((m) => (
          <button key={m} onClick={() => setModeFilter(m)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${modeFilter === m ? "bg-slate-900 text-white" : "bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--muted)]"}`}>
            {m}
          </button>
        ))}
        <span className="ml-auto text-sm text-[var(--muted-foreground)]"><strong className="text-[var(--foreground)]">{filtered.length}</strong> summits</span>
      </div>

      <div className="space-y-4">
        {filtered.map((s, i) => {
          const fillPct = Math.min(100, (s.registered / s.seats) * 100);
          return (
            <div key={s.id} style={{ animationDelay:`${i * 70}ms` }}
              className="group flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card hover-lift animate-slide-up">

              <div className={`h-24 sm:h-20 sm:w-32 shrink-0 bg-gradient-to-br ${s.gradient} rounded-xl flex items-center justify-center text-4xl`}>
                {s.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                  <div>
                    {s.badge && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mr-2">{s.badge}</span>}
                    <h3 className="font-semibold text-[var(--foreground)] text-sm inline group-hover:text-[var(--primary)] transition-colors">{s.title}</h3>
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-lg ${s.price === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                    {s.price === 0 ? "Free" : `₹${s.price}`}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-1">{s.organizer}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)] mb-2">
                  <span>📅 {s.date}</span>
                  <span>📍 {s.location}</span>
                  <span>🌐 {s.mode}</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">🎤 {s.speakers.join(" · ")}</p>
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full gradient-brand rounded-full" style={{ width:`${fillPct}%` }} />
                </div>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{s.registered.toLocaleString()} registered · {(s.seats - s.registered).toLocaleString()} spots left</p>
              </div>

              <div className="sm:self-center shrink-0">
                <Button variant="gradient" size="sm">
                  {s.price === 0 ? "Register Free" : "Register →"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
