"use client";

import { useState, useEffect } from "react";
import type { StoredEvent } from "@/lib/event-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/events/event-card";

const categories = [
  { id: "all",       label: "All",       icon: "🌐" },
  { id: "volunteer", label: "Volunteer", icon: "🤝" },
  { id: "college",   label: "College",   icon: "🎓" },
  { id: "workshop",  label: "Workshop",  icon: "🔧" },
  { id: "webinar",   label: "Webinar",   icon: "📹" },
  { id: "summit",    label: "Summit",    icon: "🏢" },
  { id: "career",    label: "Career",    icon: "🎯" },
  { id: "education", label: "Education", icon: "📚" },
];

const modes = ["All", "Online", "Offline", "Hybrid"];
const prices = ["All", "Free", "Paid"];
const sorts = ["Newest", "Popular", "Ending soon", "Price: Low", "Price: High"];

const mockEvents = [
  { id: "1",  title: "National Hackathon 2025",              category: "college",   emoji: "💻", organizer: "IIT Delhi",           date: "Jan 25–26", location: "New Delhi",  mode: "Offline", price: 0,    spots: 87,   tags: ["Hackathon","AI","Web Dev"],    gradient: "from-blue-600 to-indigo-700" },
  { id: "2",  title: "Climate Action Volunteer Drive",       category: "volunteer", emoji: "🌱", organizer: "GreenIndia",           date: "Jan 30",    location: "Pan India",  mode: "Offline", price: 0,    spots: 342,  tags: ["Environment","Community"],     gradient: "from-emerald-500 to-teal-600" },
  { id: "3",  title: "Full-Stack AI Development Workshop",  category: "workshop",  emoji: "🔧", organizer: "TechMentor India",     date: "Feb 3–7",   location: "Online",     mode: "Online",  price: 999,  spots: 22,   tags: ["AI","Next.js","Python"],       gradient: "from-orange-500 to-red-500" },
  { id: "4",  title: "Career Strategies Expert Panel",      category: "career",    emoji: "📹", organizer: "ApplyGuru",            date: "Feb 8",     location: "Zoom",       mode: "Online",  price: 0,    spots: 1820, tags: ["Career","Networking"],         gradient: "from-purple-500 to-violet-600" },
  { id: "5",  title: "Startup India Summit 2025",           category: "summit",    emoji: "🚀", organizer: "Startup India",        date: "Feb 14–16", location: "Bengaluru",  mode: "Offline", price: 2999, spots: 450,  tags: ["Startups","Investment"],       gradient: "from-indigo-600 to-blue-700" },
  { id: "6",  title: "Resume Review + Mock Interview",      category: "career",    emoji: "🎯", organizer: "Priya Sharma",         date: "Flexible",  location: "Google Meet",mode: "Online",  price: 599,  spots: 5,    tags: ["Resume","Interview Prep"],     gradient: "from-pink-500 to-rose-600" },
  { id: "7",  title: "Swachh Bharat Cleanliness Drive",    category: "volunteer", emoji: "🌍", organizer: "NSS VIT",              date: "Feb 2",     location: "Vellore",    mode: "Offline", price: 0,    spots: 200,  tags: ["Cleanliness","Community"],     gradient: "from-green-500 to-emerald-600" },
  { id: "8",  title: "UI/UX Design Bootcamp",              category: "workshop",  emoji: "🎨", organizer: "Designo Labs",         date: "Feb 10–14", location: "Online",     mode: "Online",  price: 1499, spots: 30,   tags: ["UI/UX","Figma","Design"],      gradient: "from-yellow-500 to-orange-500" },
  { id: "9",  title: "GATE 2025 Crash Course",             category: "education", emoji: "📚", organizer: "EduGuru",              date: "Jan 20",    location: "Online",     mode: "Online",  price: 3999, spots: 500,  tags: ["GATE","Engineering","Exam"],   gradient: "from-cyan-500 to-blue-500" },
  { id: "10", title: "Women in Tech Summit",               category: "summit",    emoji: "👩‍💻", organizer: "GirlScript",          date: "Feb 22",    location: "Pune",       mode: "Hybrid",  price: 499,  spots: 120,  tags: ["Women","Tech","Leadership"],   gradient: "from-fuchsia-500 to-purple-600" },
  { id: "11", title: "Cyber Security Workshop",            category: "workshop",  emoji: "🔐", organizer: "SecureIT India",       date: "Feb 5",     location: "Online",     mode: "Online",  price: 799,  spots: 45,   tags: ["Cybersecurity","Hacking"],     gradient: "from-slate-600 to-slate-800" },
  { id: "12", title: "Health & Wellness Webinar",          category: "webinar",   emoji: "🏥", organizer: "WellnessFirst",        date: "Feb 12",    location: "Zoom",       mode: "Online",  price: 0,    spots: 2000, tags: ["Health","Wellness","Mental"],  gradient: "from-rose-400 to-pink-500" },
];

const TYPE_EMOJI: Record<string, string>     = { Hackathon:"💻", Workshop:"🔧", Webinar:"📹", Summit:"🏢", Conference:"🎙️" };
const CAT_EMOJI: Record<string, string>      = { Volunteer:"🤝", Career:"🎯", Education:"📚", Health:"🏥", Sports:"🏆", Technology:"🚀", Business:"💼", Design:"🎨", Science:"🔬" };
const TYPE_CAT: Record<string, string>       = { Workshop:"workshop", Webinar:"webinar", Summit:"summit", Conference:"summit", Hackathon:"college" };
const CAT_CAT: Record<string, string>        = { Volunteer:"volunteer", Career:"career", Education:"education", Technology:"college", Business:"summit", Design:"workshop", Health:"webinar" };
const TYPE_GRAD: Record<string, string>      = { Hackathon:"from-blue-600 to-indigo-700", Workshop:"from-orange-500 to-red-500", Webinar:"from-purple-500 to-violet-600", Summit:"from-indigo-600 to-blue-700", Conference:"from-slate-600 to-slate-800" };
const CAT_GRAD: Record<string, string>       = { Volunteer:"from-emerald-500 to-teal-600", Career:"from-pink-500 to-rose-600", Education:"from-cyan-500 to-blue-500", Health:"from-rose-400 to-pink-500", Technology:"from-blue-500 to-indigo-600", Business:"from-indigo-500 to-blue-600" };

function storedToCard(ev: StoredEvent) {
  const category = TYPE_CAT[ev.type] ?? CAT_CAT[ev.category] ?? "college";
  const emoji    = TYPE_EMOJI[ev.type] ?? CAT_EMOJI[ev.category] ?? "📅";
  const gradient = TYPE_GRAD[ev.type] ?? CAT_GRAD[ev.category] ?? "from-violet-500 to-purple-600";
  const dateStr  = ev.date
    ? new Date(ev.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "TBD";
  return {
    id:        ev.id,
    title:     ev.title,
    category,
    emoji,
    organizer: ev.organizerName || "ApplyGuru",
    date:      dateStr,
    location:  ev.mode === "Online" ? "Online" : (ev.location || "TBD"),
    mode:      ev.mode as string,
    price:     parseInt(ev.fee) || 0,
    spots:     parseInt(ev.capacity) || 999,
    tags:      ev.tags ? ev.tags.split(",").map((t) => t.trim()).filter(Boolean) : [ev.type],
    gradient,
  };
}

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeMode, setActiveMode] = useState("All");
  const [activePrice, setActivePrice] = useState("All");
  const [activeSort, setActiveSort] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState<ReturnType<typeof storedToCard>[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setLiveEvents((data.events ?? []).map(storedToCard)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allEvents = [...liveEvents, ...mockEvents];

  const filtered = allEvents.filter((e) => {
    const matchCat   = activeCategory === "all" || e.category === activeCategory;
    const matchMode  = activeMode  === "All"  || e.mode === activeMode;
    const matchPrice = activePrice === "All"  || (activePrice === "Free" ? e.price === 0 : e.price > 0);
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
                        e.organizer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchMode && matchPrice && matchSearch;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Browse Events</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-0.5">
          Discover {allEvents.length}+ opportunities across all categories
        </p>
      </div>

      {/* Search bar */}
      <Input
        type="search"
        placeholder="Search events, organizers, keywords…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />

      {/* Category chips — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              activeCategory === cat.id
                ? "gradient-brand text-white shadow-sm"
                : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:border-brand-400"
            }`}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-[var(--muted-foreground)] mr-1">Filter:</span>

        {/* Mode */}
        <div className="flex gap-1">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeMode === m
                  ? "bg-slate-900 text-white"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-[var(--border)]" />

        {/* Price */}
        <div className="flex gap-1">
          {prices.map((p) => (
            <button
              key={p}
              onClick={() => setActivePrice(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activePrice === p
                  ? "bg-slate-900 text-white"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)]">Sort:</span>
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
            className="text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-[var(--foreground)] outline-none"
          >
            {sorts.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted-foreground)]">
          <strong className="text-[var(--foreground)]">{filtered.length}</strong> events found
        </p>
        <div className="flex gap-1">
          <button className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button className="p-1.5 rounded-lg border border-[var(--border)] bg-brand-600 text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="font-semibold text-[var(--foreground)] mb-2">No events found</h3>
          <p className="text-[var(--muted-foreground)] text-sm">Try adjusting your filters or search query</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setActiveCategory("all"); setActiveMode("All"); setActivePrice("All"); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
