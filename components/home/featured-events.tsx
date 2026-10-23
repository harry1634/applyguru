"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const events = [
  {
    id: "1",
    title: "National Hackathon 2025 — Build the Future",
    category: "college" as const,
    categoryLabel: "College Event",
    emoji: "💻",
    organizer: "IIT Delhi",
    date: "Jan 25–26, 2025",
    location: "New Delhi",
    mode: "Offline",
    price: 0,
    priceLabel: "Free",
    seats: "500 teams",
    seatsLeft: 87,
    tags: ["Hackathon", "AI/ML", "Web Dev"],
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    id: "2",
    title: "Climate Action Volunteer Drive — Plant 10,000 Trees",
    category: "volunteer" as const,
    categoryLabel: "Volunteer",
    emoji: "🌱",
    organizer: "GreenIndia Foundation",
    date: "Jan 30, 2025",
    location: "Pan India",
    mode: "Offline",
    price: 0,
    priceLabel: "Free",
    seats: "2,000 volunteers",
    seatsLeft: 342,
    tags: ["Environment", "Nature", "Community"],
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "3",
    title: "Full-Stack AI Development Workshop",
    category: "workshop" as const,
    categoryLabel: "Workshop",
    emoji: "🔧",
    organizer: "TechMentor India",
    date: "Feb 3–7, 2025",
    location: "Online",
    mode: "Online",
    price: 999,
    priceLabel: "₹999",
    seats: "100 seats",
    seatsLeft: 22,
    tags: ["AI", "Next.js", "Python"],
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "4",
    title: "Career Strategies for 2025 — Expert Panel",
    category: "webinar" as const,
    categoryLabel: "Webinar",
    emoji: "📹",
    organizer: "ApplyGuru x LinkedIn",
    date: "Feb 8, 2025",
    location: "Zoom",
    mode: "Online",
    price: 0,
    priceLabel: "Free",
    seats: "5,000 seats",
    seatsLeft: 1820,
    tags: ["Career", "Networking", "HR"],
    gradient: "from-purple-500 to-violet-600",
  },
  {
    id: "5",
    title: "Startup India Summit 2025",
    category: "summit" as const,
    categoryLabel: "Summit",
    emoji: "🚀",
    organizer: "Startup India",
    date: "Feb 14–16, 2025",
    location: "Bengaluru",
    mode: "Offline",
    price: 2999,
    priceLabel: "₹2,999",
    seats: "3,000 attendees",
    seatsLeft: 450,
    tags: ["Startups", "Investment", "Networking"],
    gradient: "from-indigo-600 to-blue-700",
  },
  {
    id: "6",
    title: "Resume Review + Mock Interview Bundle",
    category: "career" as const,
    categoryLabel: "Career Guidance",
    emoji: "🎯",
    organizer: "Priya Sharma, Ex-Google",
    date: "Flexible slots",
    location: "Google Meet",
    mode: "Online",
    price: 599,
    priceLabel: "₹599",
    seats: "1:1 session",
    seatsLeft: 5,
    tags: ["Resume", "Interview Prep", "1-on-1"],
    gradient: "from-pink-500 to-rose-600",
  },
];

const TABS = [
  { key: "all",      label: "All",       emoji: "✨" },
  { key: "college",  label: "Hackathons", emoji: "💻" },
  { key: "volunteer",label: "Volunteer",  emoji: "🌱" },
  { key: "workshop", label: "Workshops",  emoji: "🔧" },
  { key: "webinar",  label: "Webinars",   emoji: "📹" },
  { key: "career",   label: "Career",     emoji: "🎯" },
];

export function FeaturedEvents() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all"
    ? events
    : events.filter((e) => e.category === activeTab);

  return (
    <section className="py-24 bg-slate-50">
      <div className="w-full px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-3 py-1 mb-4">
              ✨ Featured
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Trending right now
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/events">
              View all events
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
                activeTab === tab.key
                  ? "gradient-brand text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(filtered.length > 0 ? filtered : events).map((event, i) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              style={{ animationDelay: `${i * 80}ms` }}
              className="group rounded-2xl border border-slate-100 bg-white shadow-card hover:shadow-xl hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 overflow-hidden flex flex-col animate-slide-up"
            >
              {/* Color header */}
              <div className={`h-36 bg-gradient-to-br ${event.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_25%_25%,white,transparent_55%)]" />
                <span className="text-6xl opacity-90 group-hover:scale-110 transition-transform duration-300 relative z-10 drop-shadow-lg">
                  {event.emoji}
                </span>
                <div className="absolute top-3 left-3">
                  <Badge variant={event.category}>{event.categoryLabel}</Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm ${event.price === 0 ? "bg-white/20 text-white border border-white/30" : "bg-white text-slate-800 shadow-sm"}`}>
                    {event.priceLabel}
                  </span>
                </div>
                {event.seatsLeft < 50 && (
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-bold text-white bg-red-500/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      🔥 Only {event.seatsLeft} left
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-1.5 mb-4 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {event.organizer}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location} · {event.mode}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {event.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <span className="text-xs text-slate-500">
                    <strong className="text-red-500">{event.seatsLeft}</strong> spots left
                  </span>
                  <span className="text-xs font-semibold text-[var(--primary)] group-hover:underline">
                    View details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
