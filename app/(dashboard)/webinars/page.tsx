"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const topics = ["All", "Career", "Technology", "Finance", "Health", "Entrepreneurship", "Education", "HR & Hiring", "Government Schemes"];

const webinars = [
  { id:"wb1", emoji:"🚀", title:"Breaking into Product Management in 2025",     speakers:["Ravi Kumar (Google)", "Anita Shah (Meta)"], date:"Feb 8, 2025",  time:"7:00 PM IST", duration:"90 min", mode:"Zoom",       topic:"Career",         price:0,   seats:5000,  registered:3820, live:false, badge:"" },
  { id:"wb2", emoji:"🤖", title:"The AI Revolution: What It Means for You",     speakers:["Dr. Priya Nair"],                          date:"Feb 10, 2025", time:"6:00 PM IST", duration:"60 min", mode:"YouTube",    topic:"Technology",     price:0,   seats:10000, registered:8100, live:false, badge:"🔥 Trending" },
  { id:"wb3", emoji:"💰", title:"Personal Finance & Investment for Millennials", speakers:["CA Mohit Gupta"],                          date:"Feb 12, 2025", time:"8:00 PM IST", duration:"75 min", mode:"Zoom",       topic:"Finance",        price:199, seats:500,   registered:287,  live:false, badge:"" },
  { id:"wb4", emoji:"💼", title:"Ace Your Next Job Interview",                  speakers:["Kavya Reddy (Deloitte)","Arun S (KPMG)"], date:"Today",        time:"Live Now",    duration:"60 min", mode:"Zoom",       topic:"Career",         price:0,   seats:2000,  registered:1650, live:true,  badge:"🔴 Live" },
  { id:"wb5", emoji:"🌍", title:"Government Schemes for Students 2025",         speakers:["IAS Officer Raj Sharma"],                  date:"Feb 15, 2025", time:"5:00 PM IST", duration:"90 min", mode:"YouTube",    topic:"Government Schemes", price:0,seats:20000, registered:6500, live:false, badge:"" },
  { id:"wb6", emoji:"🏥", title:"Mental Health & Burnout Prevention",           speakers:["Dr. Sneha Patel"],                         date:"Feb 16, 2025", time:"9:00 AM IST", duration:"60 min", mode:"Google Meet",topic:"Health",         price:0,   seats:3000,  registered:1200, live:false, badge:"New" },
];

export default function WebinarsPage() {
  const [search, setSearch] = useState("");
  const [topic, setTopic]   = useState("All");
  const [liveOnly, setLiveOnly] = useState(false);

  const filtered = webinars.filter((w) => {
    const matchTopic  = topic === "All" || w.topic === topic;
    const matchLive   = !liveOnly || w.live;
    const matchSearch = !search || w.title.toLowerCase().includes(search.toLowerCase());
    return matchTopic && matchLive && matchSearch;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Webinars</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-0.5">Learn from industry experts — live & on-demand</p>
        </div>
        <button onClick={() => setLiveOnly(!liveOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${liveOnly ? "bg-red-500 text-white border-red-500" : "bg-[var(--card)] border-[var(--border)] hover:border-red-400 text-[var(--foreground)]"}`}>
          <span className="animate-pulse w-2 h-2 bg-current rounded-full inline-block" />
          Live Now
        </button>
      </div>

      <Input type="search" placeholder="Search webinars, speakers, topics…" value={search} onChange={(e) => setSearch(e.target.value)}
        leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
      />

      {/* Topic filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {topics.map((t) => (
          <button key={t} onClick={() => setTopic(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-all ${topic === t ? "gradient-brand text-white shadow-sm" : "bg-[var(--card)] border border-[var(--border)] hover:border-brand-400"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Webinar cards */}
      <div className="space-y-4">
        {filtered.map((w, i) => (
          <Link key={w.id} href={`/webinars/${w.id}`}
            style={{ animationDelay:`${i * 60}ms` }}
            className="group flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card hover-lift animate-slide-up">

            {/* Thumbnail */}
            <div className="h-24 sm:h-20 sm:w-32 shrink-0 gradient-brand rounded-xl flex items-center justify-center text-4xl relative overflow-hidden">
              {w.emoji}
              {w.live && (
                <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  {w.badge && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mr-2">{w.badge}</span>}
                  <h3 className="font-semibold text-[var(--foreground)] text-sm inline group-hover:text-[var(--primary)] transition-colors">{w.title}</h3>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-lg ${w.price === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                  {w.price === 0 ? "Free" : `₹${w.price}`}
                </span>
              </div>

              <p className="text-xs text-[var(--muted-foreground)] mb-2">
                🎤 {w.speakers.join(" · ")}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
                <span>📅 {w.date} · {w.time}</span>
                <span>⏱ {w.duration}</span>
                <span>📺 {w.mode}</span>
                <span className="text-emerald-600 font-semibold ml-auto">
                  {w.registered.toLocaleString()} registered
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full gradient-brand rounded-full" style={{ width:`${Math.min(100, (w.registered / w.seats) * 100)}%` }} />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{w.seats - w.registered} seats remaining</p>
            </div>

            {/* Register CTA */}
            <div className="sm:self-center shrink-0">
              <Button variant={w.live ? "default" : "gradient"} size="sm" className={w.live ? "bg-red-500 hover:bg-red-600 text-white" : ""}>
                {w.live ? "Join Now →" : "Register Free"}
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
