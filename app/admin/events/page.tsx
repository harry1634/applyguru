"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdminEvent {
  id: string;
  title: string;
  organizerEmail: string;
  organizerName: string;
  type: string;
  category: string;
  mode: "Online" | "Offline" | "Hybrid";
  date: string;
  location: string;
  capacity: string;
  fee: string;
  status: "published" | "draft";
  createdAt: string;
}

interface Activity { email: string; type: string; itemId: string; itemTitle: string; timestamp: string }

type SortKey = "title" | "organizerName" | "date" | "fee" | "registrations" | "capacity" | "status" | "createdAt";
type SortDir = "asc" | "desc";

const MODE_BADGE: Record<string, string> = {
  Online:  "bg-blue-100 text-blue-700",
  Offline: "bg-orange-100 text-orange-700",
  Hybrid:  "bg-violet-100 text-violet-700",
};
const STATUS_BADGE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft:     "bg-slate-100 text-slate-500",
};

function fmt(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function SortTh({ label, k, sort, dir, onSort }: { label: string; k: SortKey; sort: SortKey; dir: SortDir; onSort: (k: SortKey) => void }) {
  const active = sort === k;
  return (
    <th onClick={() => onSort(k)} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-slate-800 select-none">
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={active ? "text-violet-500" : "text-slate-300"}>{active ? (dir === "asc" ? "↑" : "↓") : "↕"}</span>
      </span>
    </th>
  );
}

export default function AdminEventsPage() {
  const [events,     setEvents]     = useState<AdminEvent[]>([]);
  const [regCounts,  setRegCounts]  = useState<Record<string, number>>({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [filterFee,  setFilterFee]  = useState("all");
  const [sortKey,    setSortKey]    = useState<SortKey>("createdAt");
  const [sortDir,    setSortDir]    = useState<SortDir>("desc");
  const [toast,      setToast]      = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [evRes, actRes] = await Promise.all([
      fetch("/api/events?all=true").then((r) => r.json()),
      fetch("/api/activities").then((r) => r.json()),
    ]);

    const evs: AdminEvent[] = evRes.events ?? [];
    const acts: Activity[]  = actRes.activities ?? [];

    // Count registrations per event ID
    const counts: Record<string, number> = {};
    for (const a of acts) {
      if (["event-registered", "workshop-enrolled", "webinar-registered"].includes(a.type)) {
        counts[a.itemId] = (counts[a.itemId] ?? 0) + 1;
      }
    }

    setEvents(evs);
    setRegCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  };

  const getVal = (e: AdminEvent, k: SortKey): string | number => {
    switch (k) {
      case "fee":           return parseInt(e.fee) || 0;
      case "capacity":      return parseInt(e.capacity) || 0;
      case "registrations": return regCounts[e.id] ?? 0;
      case "date":          return e.date;
      case "createdAt":     return e.createdAt;
      case "status":        return e.status;
      case "organizerName": return e.organizerName.toLowerCase();
      default:              return e.title.toLowerCase();
    }
  };

  const filtered = events
    .filter((e) => {
      const q = search.toLowerCase();
      const matchQ = e.title.toLowerCase().includes(q) || e.organizerName.toLowerCase().includes(q) || e.organizerEmail.toLowerCase().includes(q);
      const matchMode = filterMode === "all" || e.mode === filterMode;
      const matchFee  = filterFee  === "all" || (filterFee === "free" ? parseInt(e.fee) === 0 : parseInt(e.fee) > 0);
      return matchQ && matchMode && matchFee;
    })
    .sort((a, b) => {
      const av = getVal(a, sortKey), bv = getVal(b, sortKey);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalReg = Object.values(regCounts).reduce((s, n) => s + n, 0);
  const totalFee = events.reduce((s, e) => s + (parseInt(e.fee) || 0), 0);

  const thProps = { sort: sortKey, dir: sortDir, onSort: handleSort };

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg">✅ {toast}</div>
      )}

      <header className="h-16 border-b border-[var(--border)] bg-white flex items-center px-6 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard"><div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">AG</span></div></Link>
          <span className="text-slate-300">/</span>
          <Link href="/admin/users" className="text-sm text-slate-500 hover:text-slate-800">Admin · Users</Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Events</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/jobs"><Button variant="outline" size="sm">Jobs</Button></Link>
          <Link href="/admin/users"><Button variant="outline" size="sm">Users</Button></Link>
          <Button variant="outline" size="sm" onClick={fetchAll}>Refresh</Button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Events</h1>
          <p className="text-slate-500 text-sm mt-0.5">Click any column to sort. Click an event title to see participant details.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Events",     value: events.length,                                    color: "text-slate-900" },
            { label: "Published",        value: events.filter((e) => e.status === "published").length, color: "text-emerald-600" },
            { label: "Total Registrations", value: totalReg,                                     color: "text-blue-600" },
            { label: "Avg. Fee (₹)",     value: events.length ? Math.round(totalFee / events.length) : 0, color: "text-violet-600" },
          ].map((s) => (
            <Card key={s.label}><CardContent className="p-5">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value.toLocaleString("en-IN")}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </CardContent></Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, organizer, email…"
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
          <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
            <option value="all">All modes</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          <select value={filterFee} onChange={(e) => setFilterFee(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
            <option value="all">All pricing</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading events…</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">📅</p>
                <p className="font-semibold text-slate-800 mb-1">{events.length === 0 ? "No events yet" : "No events match your filter"}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-slate-50">
                    <SortTh label="Event"         k="title"         {...thProps} />
                    <SortTh label="Organizer"      k="organizerName" {...thProps} />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode</th>
                    <SortTh label="Date"          k="date"          {...thProps} />
                    <SortTh label="Fee (₹)"       k="fee"           {...thProps} />
                    <SortTh label="Capacity"      k="capacity"      {...thProps} />
                    <SortTh label="Registrations" k="registrations" {...thProps} />
                    <SortTh label="Status"        k="status"        {...thProps} />
                    <SortTh label="Created"       k="createdAt"     {...thProps} />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ev) => {
                    const fee      = parseInt(ev.fee) || 0;
                    const capacity = parseInt(ev.capacity) || 0;
                    const regs     = regCounts[ev.id] ?? 0;
                    const fillPct  = capacity > 0 ? Math.min(100, Math.round((regs / capacity) * 100)) : 0;

                    return (
                      <tr key={ev.id} className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50 transition-colors">
                        {/* Event title */}
                        <td className="px-4 py-3 max-w-[220px]">
                          <Link href={`/admin/events/${ev.id}`} className="font-semibold text-slate-900 hover:text-violet-700 transition-colors text-xs leading-tight line-clamp-2 block">
                            {ev.title}
                          </Link>
                          <p className="text-[10px] text-slate-400 mt-0.5">{ev.type} · {ev.category}</p>
                        </td>
                        {/* Organizer */}
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">{ev.organizerName}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{ev.organizerEmail}</p>
                        </td>
                        {/* Mode */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${MODE_BADGE[ev.mode]}`}>{ev.mode}</span>
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{fmt(ev.date)}</td>
                        {/* Fee */}
                        <td className="px-4 py-3 text-xs font-bold whitespace-nowrap">
                          {fee === 0
                            ? <span className="text-emerald-600">Free</span>
                            : <span className="text-slate-800">₹{fee.toLocaleString("en-IN")}</span>}
                        </td>
                        {/* Capacity */}
                        <td className="px-4 py-3 text-xs text-slate-600 text-center whitespace-nowrap">
                          {capacity > 0 ? capacity.toLocaleString("en-IN") : <span className="text-slate-300">—</span>}
                        </td>
                        {/* Registrations with mini progress */}
                        <td className="px-4 py-3 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${regs > 0 ? "text-blue-700" : "text-slate-400"}`}>{regs}</span>
                            {capacity > 0 && (
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[50px]">
                                <div className="h-full gradient-brand rounded-full" style={{ width: `${fillPct}%` }} />
                              </div>
                            )}
                            {capacity > 0 && <span className="text-[10px] text-slate-400">{fillPct}%</span>}
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
                        </td>
                        {/* Created */}
                        <td className="px-4 py-3 text-[10px] text-slate-400 whitespace-nowrap">{fmt(ev.createdAt)}</td>
                        {/* Details link */}
                        <td className="px-4 py-3">
                          <Link href={`/admin/events/${ev.id}`} className="text-xs text-violet-600 hover:text-violet-800 font-semibold transition-colors">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <p className="text-xs text-slate-400 text-center">
          Data from <code className="bg-slate-100 px-1 rounded">data/events.json</code> and <code className="bg-slate-100 px-1 rounded">data/activities.json</code>
        </p>
      </div>
    </div>
  );
}
