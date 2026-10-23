"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const specializations = ["All", "Career Switch", "Resume Review", "Mock Interview", "Study Abroad", "MBA", "GATE/GRE", "Salary Negotiation", "Entrepreneurship"];

const counselors = [
  { id:"c1", name:"Priya Sharma",    role:"Senior Product Manager",     company:"ex-Google, Microsoft", avatar:null, rating:4.9, sessions:420, price:599,  specializations:["Career Switch","Resume Review","Mock Interview"], available:["Today 4PM","Tomorrow 10AM","Tomorrow 2PM"], badge:"Top Rated", gradient:"from-violet-400 to-purple-500" },
  { id:"c2", name:"Arjun Kapoor",    role:"IITian | IIM Alumni",        company:"McKinsey & Co",        avatar:null, rating:4.8, sessions:280, price:999,  specializations:["MBA","Career Switch","Salary Negotiation"],      available:["Tomorrow 11AM","Feb 3 4PM"],                badge:"Premium",   gradient:"from-blue-400 to-indigo-500" },
  { id:"c3", name:"Dr. Meera Iyer",  role:"PhD, Columbia University",   company:"Study Abroad Expert",  avatar:null, rating:4.9, sessions:350, price:799,  specializations:["Study Abroad","GATE/GRE","MBA"],                  available:["Today 6PM","Tomorrow 9AM"],                 badge:"Top Rated", gradient:"from-emerald-400 to-teal-500" },
  { id:"c4", name:"Rohan Verma",     role:"SDE-3 at Amazon",            company:"ex-Flipkart, OYO",     avatar:null, rating:4.7, sessions:190, price:499,  specializations:["Mock Interview","Resume Review","Career Switch"],  available:["Today 8PM","Feb 2 11AM"],                   badge:"",          gradient:"from-orange-400 to-amber-500" },
  { id:"c5", name:"Sneha Reddy",     role:"HR Director",                company:"Infosys, Wipro",       avatar:null, rating:4.8, sessions:510, price:399,  specializations:["Resume Review","Mock Interview","Salary Negotiation"], available:["Tomorrow 3PM","Feb 3 5PM"],           badge:"Top Rated", gradient:"from-pink-400 to-rose-500" },
  { id:"c6", name:"Vikram Nair",     role:"Founder & Serial Entrepreneur",company:"3 Startups, YC Alum", avatar:null, rating:4.9, sessions:160, price:1499, specializations:["Entrepreneurship","Career Switch","MBA"],          available:["Feb 4 2PM","Feb 5 11AM"],                   badge:"Premium",   gradient:"from-indigo-400 to-violet-500" },
];

export default function CounselingPage() {
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("All");

  const filtered = counselors.filter((c) => {
    const matchSpec   = spec === "All" || c.specializations.includes(spec);
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero banner */}
      <div className="rounded-2xl gradient-brand p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 mesh-hero opacity-20" />
        <div className="relative">
          <h1 className="text-2xl font-bold mb-2">Career Guidance & Counseling</h1>
          <p className="text-blue-100 text-sm mb-4">Book 1-on-1 sessions with experienced mentors from top companies</p>
          <div className="flex flex-wrap gap-3">
            {["Free Assessment →", "Group Sessions →"].map((label) => (
              <button key={label} className="bg-white/15 border border-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/25 transition-all">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <Input type="search" placeholder="Search counselors, specializations…" value={search} onChange={(e) => setSearch(e.target.value)}
        leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
      />

      {/* Specialization filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {specializations.map((s) => (
          <button key={s} onClick={() => setSpec(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${spec === s ? "gradient-brand text-white shadow-sm" : "bg-[var(--card)] border border-[var(--border)] hover:border-brand-400"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Counselors grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((c, i) => (
          <div key={c.id} style={{ animationDelay:`${i * 80}ms` }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card hover-lift overflow-hidden flex flex-col animate-slide-up">

            {/* Header gradient */}
            <div className={`h-20 bg-gradient-to-r ${c.gradient} relative`}>
              {c.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-white/90 text-slate-800 px-2 py-0.5 rounded-full">
                  {c.badge}
                </span>
              )}
            </div>

            <div className="px-5 pb-5">
              {/* Avatar overlapping the gradient */}
              <div className="-mt-8 mb-3">
                <Avatar name={c.name} gradient={c.gradient} size="xl" className="ring-4 ring-[var(--card)]" />
              </div>

              <h3 className="font-bold text-[var(--foreground)]">{c.name}</h3>
              <p className="text-xs text-[var(--primary)] font-medium">{c.role}</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">{c.company}</p>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <p className="text-sm font-bold text-amber-500">★ {c.rating}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">Rating</p>
                </div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{c.sessions}+</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">Sessions</p>
                </div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">₹{c.price}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">per session</p>
                </div>
              </div>

              {/* Specializations */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {c.specializations.map((s) => (
                  <Badge key={s} variant="subtle" size="sm">{s}</Badge>
                ))}
              </div>

              {/* Available slots */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1.5">Next available:</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.available.slice(0, 2).map((slot) => (
                    <span key={slot} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg font-medium">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              <Button variant="gradient" className="w-full" asChild>
                <Link href={`/counseling/${c.id}`}>Book Session →</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
