"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Activity {
  id: string; email: string; type: string;
  itemId: string; itemTitle: string; itemDetails?: string; timestamp: string;
}

interface StoredEvent {
  id: string; title: string; type: string; category: string;
  organizerName: string; organizerEmail: string;
  mode: string; date: string; time: string; location: string;
  fee: string; capacity: string; status: string;
}

interface AppItem {
  id: string;
  kind: "event" | "job";
  title: string;
  subtitle: string;       // organizer name / company
  detail: string;         // date+mode / location+type
  fee: string;            // "Free" | "₹X" / salary
  isPaid: boolean;
  organizerEmail?: string;
  timestamp: string;
  eventId?: string;
  mode?: string;
}

const TYPE_ICON: Record<string, string> = {
  "event-registered":   "🎟️",
  "workshop-enrolled":  "🔧",
  "webinar-registered": "📹",
  "job-applied":        "💼",
};

const KIND_COLOR: Record<string, string> = {
  event: "bg-blue-100 text-blue-700",
  job:   "bg-violet-100 text-violet-700",
};

const KIND_LABEL: Record<string, string> = {
  "event-registered":   "Event",
  "workshop-enrolled":  "Workshop",
  "webinar-registered": "Webinar",
  "job-applied":        "Job",
};

function fmt(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtTs(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [items,          setItems]          = useState<AppItem[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [filter,         setFilter]         = useState("All");
  const [cancelTarget,   setCancelTarget]   = useState<AppItem | null>(null);
  const [cancelling,     setCancelling]     = useState<string | null>(null);
  const [refundModal,    setRefundModal]    = useState<{ title: string; organizerEmail: string } | null>(null);

  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }

    Promise.all([
      fetch(`/api/activities?email=${encodeURIComponent(userEmail)}`).then((r) => r.json()),
      fetch("/api/events?all=true").then((r) => r.json()),
    ]).then(([actData, evData]) => {
      const acts: Activity[] = actData.activities ?? [];
      const evs: StoredEvent[] = evData.events ?? [];

      const evMap: Record<string, StoredEvent> = {};
      for (const e of evs) evMap[e.id] = e;

      const appItems: AppItem[] = acts
        .filter((a) => ["event-registered", "workshop-enrolled", "webinar-registered", "job-applied"].includes(a.type))
        .map((a): AppItem => {
          if (a.type === "job-applied") {
            // itemDetails format: "Company · Location · Type · Salary"
            const parts = (a.itemDetails ?? "").split(" · ");
            const company  = parts[0] ?? "Unknown Company";
            const location = parts[1] ?? "";
            const jobType  = parts[2] ?? "";
            const salary   = parts[3] ?? "";
            return {
              id:        a.id,
              kind:      "job",
              title:     a.itemTitle,
              subtitle:  company,
              detail:    [location, jobType].filter(Boolean).join(" · "),
              fee:       salary || "—",
              isPaid:    false,
              timestamp: a.timestamp,
            };
          }
          // Event-type
          const ev = evMap[a.itemId];
          const fee = ev ? (parseInt(ev.fee) || 0) : 0;
          const dateStr = ev?.date ? fmt(ev.date) : (a.itemDetails?.split(" · ")[0] ?? "—");
          const mode    = ev?.mode ?? (a.itemDetails?.split(" · ").pop() ?? "");
          return {
            id:             a.id,
            kind:           "event",
            title:          a.itemTitle,
            subtitle:       ev?.organizerName ?? "Organizer",
            detail:         [dateStr, mode].filter(Boolean).join(" · "),
            fee:            fee === 0 ? "Free" : `₹${fee.toLocaleString("en-IN")}`,
            isPaid:         fee > 0,
            organizerEmail: ev?.organizerEmail,
            timestamp:      a.timestamp,
            eventId:        a.itemId,
            mode,
          };
        })
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      setItems(appItems);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [userEmail]);

  const handleCancel = async (item: AppItem) => {
    if (!userEmail) return;
    setCancelling(item.id);
    try {
      await fetch(`/api/activities?id=${encodeURIComponent(item.id)}&email=${encodeURIComponent(userEmail)}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (item.isPaid && item.organizerEmail) {
        setRefundModal({ title: item.title, organizerEmail: item.organizerEmail });
      }
    } catch {
      /* silently ignore */
    } finally {
      setCancelling(null);
      setCancelTarget(null);
    }
  };

  const filters = ["All", "Events", "Jobs"];

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !search || item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q);
    const matchFilter = filter === "All"
      || (filter === "Events" && item.kind === "event")
      || (filter === "Jobs"   && item.kind === "job");
    return matchSearch && matchFilter;
  });

  const eventCount = items.filter((i) => i.kind === "event").length;
  const jobCount   = items.filter((i) => i.kind === "job").length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Cancel confirmation dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <p className="text-lg font-bold text-slate-900 mb-1">Cancel {cancelTarget.kind === "job" ? "application" : "registration"}?</p>
            <p className="text-sm text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">{cancelTarget.title}</span>
            </p>
            {cancelTarget.isPaid && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                ⚠️ This was a paid event. You will be guided to contact the organizer for a refund after cancellation.
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setCancelTarget(null)}>Keep it</Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
                loading={cancelling === cancelTarget.id}
                onClick={() => handleCancel(cancelTarget)}
              >
                Yes, cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund info modal (shown after paid event cancellation) */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">💸</div>
            <p className="text-lg font-bold text-slate-900 mb-1">Registration Cancelled</p>
            <p className="text-sm text-slate-500 mb-4">
              Since <span className="font-semibold text-slate-700">{refundModal.title}</span> was a paid event, contact the organizer to request a refund.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-slate-400 mb-0.5">Organizer email</p>
              <p className="text-sm font-semibold text-slate-800 break-all">{refundModal.organizerEmail}</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(refundModal.organizerEmail)}&su=${encodeURIComponent(`Refund Request — ${refundModal.title}`)}&body=${encodeURIComponent(`Hi,\n\nI recently cancelled my registration for "${refundModal.title}" and would like to request a refund.\n\nPlease let me know the next steps.\n\nThank you.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold text-center hover:opacity-90 transition-opacity"
              >
                ✉️ Email organizer for refund
              </a>
              <Button variant="outline" className="w-full" onClick={() => setRefundModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">My Applications</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-0.5">Events you registered for and jobs you applied to</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",           value: items.length,  icon: "📤", color: "text-slate-900" },
          { label: "Events Joined",   value: eventCount,    icon: "🎟️", color: "text-blue-600" },
          { label: "Jobs Applied",    value: jobCount,      icon: "💼", color: "text-violet-600" },
          { label: "This Month",      value: items.filter((i) => {
              const d = new Date(i.timestamp);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length, icon: "📅", color: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search title, company, organizer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${filter === f ? "gradient-brand text-white border-transparent" : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)]"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Applications list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[var(--muted)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !userEmail ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-semibold text-[var(--foreground)] mb-1">Sign in to view your applications</p>
          <Button variant="gradient" size="sm" asChild className="mt-3"><Link href="/login">Sign In</Link></Button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-[var(--foreground)]">No applications yet</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Register for events or apply to jobs — they&apos;ll all show up here</p>
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="outline" size="sm" asChild><Link href="/events">Browse Events</Link></Button>
            <Button variant="gradient" size="sm" asChild><Link href="/jobs">Browse Jobs</Link></Button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-medium">No results for &quot;{search}&quot;</p>
          <p className="text-sm mt-1">Try a different search term or filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className="hover:shadow-card-hover transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="h-12 w-12 rounded-xl bg-[var(--muted)] flex items-center justify-center text-2xl shrink-0">
                    {TYPE_ICON[item.kind === "event" ? "event-registered" : "job-applied"]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[var(--foreground)] leading-tight">{item.title}</h3>
                        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{item.subtitle}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${KIND_COLOR[item.kind]}`}>
                        {item.kind === "event" ? "✓ Registered" : "✓ Applied"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
                      {item.detail && <span>📍 {item.detail}</span>}
                      <span>{item.kind === "event" ? "🎟️" : "💰"} {item.fee}</span>
                      <span className="ml-auto">📅 {fmtTs(item.timestamp)}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-4">
                      {item.kind === "event" && item.eventId && (
                        <Link href={`/events/${item.eventId}`}
                          className="text-xs text-violet-600 hover:text-violet-800 font-semibold transition-colors">
                          View event details →
                        </Link>
                      )}
                      <button
                        onClick={() => setCancelTarget(item)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors ml-auto"
                      >
                        Cancel {item.kind === "job" ? "application" : "registration"}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
