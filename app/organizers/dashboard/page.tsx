"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Activity } from "@/lib/activity-store";
import type { StoredEvent } from "@/lib/event-store";

interface StoredUser {
  name: string; email: string; image: string | null;
  phone?: string; college?: string; orgName?: string; role: string;
}

interface Confirmation {
  id: string; activityId: string; eventId: string;
  participantEmail: string; status: "confirmed" | "rejected"; confirmedAt: string;
}

type Tab = "overview" | "events" | "jobs" | "analytics";

const REGISTER_TYPES = ["event-registered", "workshop-enrolled", "webinar-registered"] as const;
type RegType = typeof REGISTER_TYPES[number];

const TYPE_COLORS: Record<string, string> = {
  Event: "bg-amber-500", Workshop: "bg-violet-500", Hackathon: "bg-cyan-500",
  Webinar: "bg-emerald-500", Summit: "bg-blue-500", Conference: "bg-rose-500",
};

function fmtTs(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function OrganizerDashboard() {
  const { data: session } = useSession();
  const { profile } = useUser();
  const [tab, setTab] = useState<Tab>("overview");
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [myEvents_data, setMyEventsData] = useState<StoredEvent[]>([]);
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, StoredUser>>({});
  const [loadingActs, setLoadingActs] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [closedJobIds, setClosedJobIds] = useState<Set<string>>(new Set());
  const [confirmCloseId, setConfirmCloseId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  const email   = session?.user?.email ?? profile.email;
  const orgName = profile.orgName || session?.user?.name || profile.name || "Your Organization";

  useEffect(() => {
    if (!email) return;
    Promise.all([
      fetch(`/api/activities?email=${encodeURIComponent(email)}`).then((r) => r.json()),
      fetch(`/api/activities`).then((r) => r.json()),
      fetch(`/api/events?organizer=${encodeURIComponent(email)}`).then((r) => r.json()),
      fetch("/api/confirmations").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ])
      .then(([mine, all, evs, confs, usrs]) => {
        setMyActivities(mine.activities ?? []);
        setAllActivities(all.activities ?? []);
        setMyEventsData(evs.events ?? []);
        // Only store confirmed ones — rejected are not visible to organizer
        setConfirmations(
          (confs.confirmations ?? []).filter((c: Confirmation) => c.status === "confirmed")
        );
        const uMap: Record<string, StoredUser> = {};
        for (const u of (usrs.users ?? [])) uMap[u.email] = u;
        setUsersMap(uMap);
      })
      .catch(() => {})
      .finally(() => setLoadingActs(false));
  }, [email]);

  const handleCloseJob = async (jobItemId: string) => {
    setClosingId(jobItemId);
    try {
      await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jobItemId, status: "draft" }),
      });
      setClosedJobIds((prev) => new Set([...prev, jobItemId]));
    } catch { /* silent */ }
    setClosingId(null);
    setConfirmCloseId(null);
  };

  const myEvents   = myActivities.filter((a) => a.type === "event-created");
  const myJobs     = myActivities.filter((a) => a.type === "job-posted");
  const myEventIds = new Set(myEvents.map((e) => e.itemId));
  const myJobIds   = new Set(myJobs.map((j) => j.itemId));
  const jobApplications = allActivities.filter((a) => a.type === "job-applied" && myJobIds.has(a.itemId));

  const allRegistrations = allActivities.filter(
    (a) => REGISTER_TYPES.includes(a.type as RegType) && myEventIds.has(a.itemId)
  );
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthRegs = allRegistrations.filter((a) => new Date(a.timestamp) >= monthStart).length;

  const typeCounts: Record<string, number> = {};
  myEvents.forEach((ev) => {
    const type = (ev.itemDetails ?? "").split("·")[2]?.trim() || "Event";
    typeCounts[type] = (typeCounts[type] ?? 0) + 1;
  });
  const typeBreakdown = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  const getRegCount = (itemId: string) =>
    allActivities.filter((a) => REGISTER_TYPES.includes(a.type as RegType) && a.itemId === itemId).length;

  // Admin-confirmed participants keyed by eventId
  const confirmedByEvent: Record<string, Confirmation[]> = {};
  for (const c of confirmations) {
    if (!myEventIds.has(c.eventId)) continue;
    if (!confirmedByEvent[c.eventId]) confirmedByEvent[c.eventId] = [];
    confirmedByEvent[c.eventId].push(c);
  }
  const getConfirmedCount = (eventId: string) => confirmedByEvent[eventId]?.length ?? 0;
  const totalConfirmed = confirmations.filter((c) => myEventIds.has(c.eventId)).length;

  const feeMap: Record<string, number> = {};
  for (const ev of myEvents_data) feeMap[ev.id] = parseInt(ev.fee) || 0;

  // Revenue = all registrations × fee (contact details remain gated by admin)
  const totalRevenue = myEvents.reduce((sum, ev) => {
    return sum + (feeMap[ev.itemId] ?? 0) * getRegCount(ev.itemId);
  }, 0);

  const thisMonthRevenue = myEvents.reduce((sum, ev) => {
    const fee = feeMap[ev.itemId] ?? 0;
    if (fee === 0) return sum;
    const monthRegs = allActivities.filter(
      (a) => REGISTER_TYPES.includes(a.type as RegType) && a.itemId === ev.itemId && new Date(a.timestamp) >= monthStart
    ).length;
    return sum + fee * monthRegs;
  }, 0);

  const fmtRev = (n: number) => n === 0 ? "₹0" : `₹${n.toLocaleString("en-IN")}`;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview",  label: "Overview" },
    { key: "events",    label: "My Events" },
    { key: "jobs",      label: "My Jobs" },
    { key: "analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-[var(--muted)]">

      {/* ── Header ── */}
      <header className="h-14 sm:h-16 border-b border-[var(--border)] bg-white flex items-center px-3 sm:px-6 justify-between sticky top-0 z-30">
        <Link href="/organizers" className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 sm:h-8 sm:w-8 gradient-brand rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs sm:text-sm">AG</span>
          </div>
          <span className="font-bold text-sm sm:text-base truncate">
            <span className="gradient-text">Apply</span><span className="text-slate-900">Guru</span>
          </span>
          <span className="ml-1 text-xs text-slate-400 font-medium hidden md:inline">/ Organizer</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/organizers/create">+ Post Event</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="sm:hidden px-2">
            <Link href="/organizers/create">📅</Link>
          </Button>
          <Button variant="gradient" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/organizers/jobs/create">+ Post Job</Link>
          </Button>
          <Button variant="gradient" size="sm" asChild className="sm:hidden px-2">
            <Link href="/organizers/jobs/create">💼</Link>
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ── Page title ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Organizer Dashboard</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">{orgName}</p>
          </div>
          <Button variant="outline" size="sm" asChild className="self-start sm:self-auto">
            <Link href="/organizers/verify">Verification Status</Link>
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: "Events Created",   value: myEvents.length,         icon: "📅", gradient: "from-violet-500 to-purple-600", sub: "Published" },
            { label: "Jobs Posted",      value: myJobs.length,           icon: "💼", gradient: "from-blue-500 to-cyan-600",     sub: "Active listings" },
            { label: "Job Applications", value: jobApplications.length,  icon: "📥", gradient: "from-pink-500 to-rose-600",     sub: "Received" },
            { label: "Registrations",    value: allRegistrations.length, icon: "👥", gradient: "from-emerald-500 to-teal-600",  sub: "All sign-ups" },
            { label: "Total Revenue",    value: fmtRev(totalRevenue),    icon: "💰", gradient: "from-orange-500 to-amber-600",  sub: "Earned" },
          ].map((s) => (
            <Card key={s.label} className="overflow-hidden hover-lift">
              <CardContent className="p-4 sm:p-5">
                <div className={`inline-flex h-9 w-9 rounded-xl bg-gradient-to-br ${s.gradient} items-center justify-center text-base mb-3 shadow-sm`}>
                  {s.icon}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</p>
                <p className="text-[11px] sm:text-xs font-semibold mt-1.5 text-emerald-600">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="overflow-x-auto -mx-3 sm:mx-0 scrollbar-none">
          <div className="flex gap-0 border-b border-[var(--border)] min-w-max px-3 sm:px-0">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${
                  tab === t.key
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

            <div className="lg:col-span-2 space-y-4">
              {/* Recent Events */}
              <Card>
                <CardHeader className="flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base flex items-center gap-2">📅 Recent Events</CardTitle>
                  <button onClick={() => setTab("events")} className="text-xs text-[var(--primary)] hover:underline font-medium">View all</button>
                </CardHeader>
                <CardContent className="pt-0 space-y-2.5">
                  {loadingActs ? (
                    <div className="py-8 text-center text-slate-400 text-sm">Loading…</div>
                  ) : myEvents.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-3xl mb-2">📅</p>
                      <p className="text-sm text-slate-500 mb-3">No events yet.</p>
                      <Button variant="gradient" size="sm" asChild>
                        <Link href="/organizers/create">Create your first event →</Link>
                      </Button>
                    </div>
                  ) : (
                    myEvents.slice(0, 3).map((ev) => {
                      const confirmed = getConfirmedCount(ev.itemId);
                      const total     = getRegCount(ev.itemId);
                      const pct       = allRegistrations.length > 0 ? Math.round((total / Math.max(...myEvents.map(e => getRegCount(e.itemId)), 1)) * 100) : 0;
                      return (
                        <div key={ev.id} className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-9 w-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-base shrink-0">📅</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[var(--foreground)] truncate">{ev.itemTitle}</p>
                              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                {new Date(ev.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                {" · "}{total} registered{confirmed > 0 ? ` · ${confirmed} confirmed` : ""}
                              </p>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-emerald-100 text-emerald-700">Live</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all" style={{ width: `${Math.max(pct, 4)}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Recent Jobs */}
              <Card>
                <CardHeader className="flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base flex items-center gap-2">💼 Posted Jobs</CardTitle>
                  <button onClick={() => setTab("jobs")} className="text-xs text-[var(--primary)] hover:underline font-medium">View all</button>
                </CardHeader>
                <CardContent className="pt-0 space-y-2.5">
                  {loadingActs ? (
                    <div className="py-6 text-center text-slate-400 text-sm">Loading…</div>
                  ) : myJobs.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-3xl mb-2">💼</p>
                      <p className="text-sm text-slate-500 mb-3">No jobs posted yet.</p>
                      <Button variant="gradient" size="sm" asChild>
                        <Link href="/organizers/jobs/create">Post your first job →</Link>
                      </Button>
                    </div>
                  ) : (
                    myJobs.slice(0, 3).map((job) => {
                      const appCount = jobApplications.filter(a => a.itemId === job.itemId).length;
                      return (
                        <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                          <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-base shrink-0">💼</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--foreground)] truncate">{job.itemTitle}</p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">{job.itemDetails ?? "—"}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-[var(--foreground)]">{appCount}</p>
                            <p className="text-[10px] text-[var(--muted-foreground)]">applicants</p>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-blue-100 text-blue-700">Active</span>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-1.5">
                  {[
                    { label: "Post a new event", href: "/organizers/create",      icon: "📅", color: "hover:bg-violet-50 hover:border-violet-200" },
                    { label: "Post a job",        href: "/organizers/jobs/create", icon: "💼", color: "hover:bg-blue-50 hover:border-blue-200" },
                    { label: "Get verified",      href: "/organizers/verify",      icon: "✅", color: "hover:bg-emerald-50 hover:border-emerald-200" },
                    { label: "View pricing",      href: "/pricing",                icon: "💳", color: "hover:bg-amber-50 hover:border-amber-200" },
                  ].map((a) => (
                    <Link key={a.href} href={a.href}
                      className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border border-[var(--border)] transition-all text-sm font-medium text-slate-700 group ${a.color}`}>
                      <span className="text-base sm:text-lg group-hover:scale-110 transition-transform">{a.icon}</span>
                      <span className="truncate">{a.label}</span>
                      <svg className="w-4 h-4 ml-auto text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Summary</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {[
                    { label: "New Registrations",   value: `${thisMonthRegs}`,       color: "text-violet-700" },
                    { label: "Job Applications",     value: `${jobApplications.length}`, color: "text-blue-700" },
                    { label: "Confirmed Participants", value: `${totalConfirmed}`,     color: "text-emerald-700" },
                    { label: "Revenue This Month",   value: fmtRev(thisMonthRevenue), color: "text-orange-700" },
                  ].map((m) => (
                    <div key={m.label} className="flex justify-between items-center text-sm">
                      <span className="text-[var(--muted-foreground)]">{m.label}</span>
                      <span className={`font-bold ${m.color}`}>{m.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── EVENTS ── */}
        {tab === "events" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{myEvents.length} event{myEvents.length !== 1 ? "s" : ""} created</p>
              <Button variant="gradient" size="sm" asChild>
                <Link href="/organizers/create">+ Post Event</Link>
              </Button>
            </div>

            {/* Admin gate notice */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <span className="text-base shrink-0">ℹ️</span>
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Participant visibility is admin-controlled.</strong> Only participants confirmed by an admin are shown below.
                Registrations pending admin review are not visible here.
              </p>
            </div>

            {loadingActs ? (
              <Card><CardContent className="p-10 text-center text-slate-400 text-sm">Loading…</CardContent></Card>
            ) : myEvents.length === 0 ? (
              <Card>
                <CardContent className="p-10 sm:p-16 text-center">
                  <p className="text-4xl mb-3">🎉</p>
                  <p className="font-semibold text-slate-800 mb-2">No events yet</p>
                  <p className="text-sm text-slate-500 mb-4">Events you create will appear here.</p>
                  <Button variant="gradient" size="sm" asChild><Link href="/organizers/create">Create your first event →</Link></Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {myEvents.map((ev) => {
                    const confirmed = getConfirmedCount(ev.itemId);
                    const total     = getRegCount(ev.itemId);
                    const fee       = feeMap[ev.itemId] ?? 0;
                    const isExpanded = expandedEventId === ev.itemId;
                    return (
                      <Card key={ev.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 gradient-brand rounded-xl flex items-center justify-center text-lg shrink-0">📅</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[var(--foreground)] text-sm leading-tight">{ev.itemTitle}</p>
                              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{ev.itemDetails ?? "—"}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Published</span>
                                <span className="text-xs text-slate-500">{total} registered</span>
                                {confirmed > 0 && <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{confirmed} confirmed</span>}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1.5">{new Date(ev.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                              {confirmed > 0 && (
                                <button
                                  onClick={() => setExpandedEventId(isExpanded ? null : ev.itemId)}
                                  className="mt-2 text-xs text-[var(--primary)] font-semibold hover:underline"
                                >
                                  {isExpanded ? "▲ Hide participants" : `▼ View ${confirmed} confirmed participant${confirmed !== 1 ? "s" : ""}`}
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Expanded confirmed participants (mobile) */}
                          {isExpanded && confirmed > 0 && (
                            <div className="mt-3 border-t border-[var(--border)] pt-3 space-y-2">
                              {(confirmedByEvent[ev.itemId] ?? []).map((c) => {
                                const user = usersMap[c.participantEmail];
                                return (
                                  <div key={c.id} className="flex items-center gap-2.5 p-2.5 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200">
                                    <div className="h-7 w-7 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                                      {(user?.name ?? c.participantEmail).slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-[var(--foreground)] truncate">{user?.name ?? "—"}</p>
                                      <p className="text-[10px] text-[var(--muted-foreground)] truncate">{c.participantEmail}</p>
                                      {(user?.phone ?? user?.college) && (
                                        <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 truncate">
                                          {user?.phone && `📞 ${user.phone}`}{user?.phone && user?.college && " · "}{user?.college && `🏫 ${user.college}`}
                                        </p>
                                      )}
                                    </div>
                                    {fee > 0 && <span className="text-[10px] font-bold text-violet-700 shrink-0">₹{fee.toLocaleString("en-IN")}</span>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block space-y-0">
                  <Card>
                    <CardContent className="p-0 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)]">
                            {["Event", "Details", "Fee", "Registrations", "Confirmed", "Revenue", "Created On", "Status", ""].map((h) => (
                              <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {myEvents.map((ev) => {
                            const fee       = feeMap[ev.itemId] ?? 0;
                            const total     = getRegCount(ev.itemId);
                            const confirmed = getConfirmedCount(ev.itemId);
                            const isExpanded = expandedEventId === ev.itemId;
                            return (
                              <>
                                <tr key={ev.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] transition-colors">
                                  <td className="px-4 py-4 font-semibold text-[var(--foreground)] max-w-[180px] truncate">{ev.itemTitle}</td>
                                  <td className="px-4 py-4 text-[var(--muted-foreground)] text-xs max-w-[160px] truncate">{ev.itemDetails ?? "—"}</td>
                                  <td className="px-4 py-4 text-xs font-bold whitespace-nowrap">
                                    {fee === 0 ? <span className="text-emerald-600">Free</span> : <span className="text-[var(--foreground)]">₹{fee.toLocaleString("en-IN")}</span>}
                                  </td>
                                  <td className="px-4 py-4 text-[var(--foreground)] font-semibold">{total}</td>
                                  <td className="px-4 py-4">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${confirmed > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                                      {confirmed}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-xs font-bold whitespace-nowrap">
                                    {fee > 0 ? <span className="text-violet-700">₹{(fee * total).toLocaleString("en-IN")}</span> : <span className="text-[var(--muted-foreground)]">—</span>}
                                  </td>
                                  <td className="px-4 py-4 text-slate-500 whitespace-nowrap text-xs">{new Date(ev.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                                  <td className="px-4 py-4"><span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">Published</span></td>
                                  <td className="px-4 py-4">
                                    {confirmed > 0 ? (
                                      <button
                                        onClick={() => setExpandedEventId(isExpanded ? null : ev.itemId)}
                                        className="text-xs text-[var(--primary)] font-semibold hover:underline whitespace-nowrap"
                                      >
                                        {isExpanded ? "▲ Hide" : "▼ Participants"}
                                      </button>
                                    ) : (
                                      <span className="text-xs text-[var(--muted-foreground)]">No confirmed</span>
                                    )}
                                  </td>
                                </tr>
                                {/* Expanded confirmed participants row */}
                                {isExpanded && confirmed > 0 && (
                                  <tr key={`${ev.id}-participants`} className="border-b border-[var(--border)] bg-[var(--muted)]">
                                    <td colSpan={9} className="px-4 py-4">
                                      <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-3">
                                        Confirmed Participants ({confirmed}) — visible only after admin approval
                                      </p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                                        {(confirmedByEvent[ev.itemId] ?? []).map((c) => {
                                          const user = usersMap[c.participantEmail];
                                          return (
                                            <div key={c.id} className="flex items-center gap-2.5 p-3 bg-[var(--card)] rounded-xl border border-emerald-200 shadow-sm">
                                              <div className="h-8 w-8 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                {(user?.name ?? c.participantEmail).slice(0, 2).toUpperCase()}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-[var(--foreground)] truncate">{user?.name ?? "—"}</p>
                                                <p className="text-[10px] text-[var(--muted-foreground)] truncate">{c.participantEmail}</p>
                                                <div className="flex gap-2 mt-0.5 flex-wrap">
                                                  {user?.phone   && <span className="text-[10px] text-[var(--muted-foreground)]">📞 {user.phone}</span>}
                                                  {user?.college && <span className="text-[10px] text-[var(--muted-foreground)]">🏫 {user.college}</span>}
                                                </div>
                                                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Confirmed {fmtTs(c.confirmedAt)}</p>
                                              </div>
                                              {fee > 0 && (
                                                <span className="text-xs font-bold text-violet-700 shrink-0">₹{fee.toLocaleString("en-IN")}</span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── JOBS ── */}
        {tab === "jobs" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{myJobs.length} listing{myJobs.length !== 1 ? "s" : ""} total</p>
              <Button variant="gradient" size="sm" asChild>
                <Link href="/organizers/jobs/create">+ Post Job</Link>
              </Button>
            </div>

            {/* Close job confirm dialog */}
            {confirmCloseId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl max-w-sm w-full mx-4">
                  <h3 className="font-bold text-slate-900 mb-2">Close this job listing?</h3>
                  <p className="text-sm text-slate-500 mb-5">
                    The listing will be set to draft and hidden from job seekers. You can repost it any time.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmCloseId(null)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCloseJob(confirmCloseId)}
                      disabled={closingId === confirmCloseId}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                      {closingId === confirmCloseId ? "Closing…" : "Close Listing"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {myJobs.length === 0 ? (
              <Card>
                <CardContent className="p-10 sm:p-16 text-center">
                  <p className="text-4xl mb-3">💼</p>
                  <p className="font-semibold text-slate-800 mb-2">No jobs posted yet</p>
                  <p className="text-sm text-slate-500 mb-4">Jobs you post will appear here.</p>
                  <Button variant="gradient" size="sm" asChild><Link href="/organizers/jobs/create">Post your first job →</Link></Button>
                </CardContent>
              </Card>
            ) : (
              myJobs.map((job) => {
                const isClosed = closedJobIds.has(job.itemId);
                const appCount = jobApplications.filter((a) => a.itemId === job.itemId).length;
                return (
                  <Card key={job.id} className={isClosed ? "opacity-60" : ""}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                        <div className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0 ${isClosed ? "bg-slate-200" : "bg-gradient-to-br from-blue-500 to-cyan-600"}`}>
                          💼
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{job.itemTitle}</h3>
                            {isClosed ? (
                              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Closed</span>
                            ) : (
                              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>
                            )}
                            {appCount > 0 && (
                              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                                {appCount} applicant{appCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">{job.itemDetails ?? "—"}</p>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2 shrink-0">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/jobs/${job.itemId}`}>View</Link>
                          </Button>
                          {!isClosed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmCloseId(job.itemId)}
                              className="text-red-500 border-red-200 hover:bg-red-50"
                            >
                              Close
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

            <Card className="md:col-span-2">
              <CardHeader className="pb-3"><CardTitle className="text-base">Top Performing Events</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                {myEvents.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-3xl mb-2">📊</p>
                    <p className="text-sm text-slate-500">Create events to see analytics.</p>
                  </div>
                ) : (() => {
                  const withRegs = myEvents
                    .map((ev) => ({ ev, regs: getRegCount(ev.itemId), confirmed: getConfirmedCount(ev.itemId) }))
                    .sort((a, b) => b.regs - a.regs);
                  const maxRegs = withRegs[0]?.regs || 1;
                  return withRegs.slice(0, 5).map(({ ev, regs, confirmed }, i) => (
                    <div key={ev.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 truncate">{ev.itemTitle}</p>
                          {confirmed > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">{confirmed} confirmed</span>
                          )}
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full gradient-brand rounded-full transition-all"
                            style={{ width: `${Math.max(Math.round((regs / maxRegs) * 100), 4)}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 shrink-0">{regs} reg{regs !== 1 ? "s" : ""}</span>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Event Type Breakdown</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                {typeBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">No events yet.</p>
                ) : typeBreakdown.map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3 text-sm">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${TYPE_COLORS[type] ?? "bg-slate-400"}`} />
                    <span className="flex-1 text-slate-700">{type}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Registration Summary</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                {[
                  { label: "Total registrations",  value: allRegistrations.length, color: "text-violet-700" },
                  { label: "Admin-confirmed",       value: totalConfirmed,           color: "text-emerald-700" },
                  { label: "This month (new regs)", value: thisMonthRegs,            color: "text-blue-700" },
                  { label: "Jobs posted",           value: myJobs.length,            color: "text-cyan-700" },
                  { label: "Job applications",      value: jobApplications.length,   color: "text-pink-700" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{r.label}</span>
                    <span className={`font-bold ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Job Applications Breakdown */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">📥 Job Applications</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                {myJobs.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">Post jobs to see applications.</p>
                ) : (() => {
                  const withApps = myJobs
                    .map((job) => ({ job, apps: jobApplications.filter(a => a.itemId === job.itemId).length }))
                    .sort((a, b) => b.apps - a.apps);
                  const maxApps = withApps[0]?.apps || 1;
                  return withApps.map(({ job, apps }, i) => (
                    <div key={job.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate mb-1">{job.itemTitle}</p>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                            style={{ width: `${Math.max(Math.round((apps / maxApps) * 100), apps > 0 ? 8 : 0)}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 shrink-0">{apps}</span>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3"><CardTitle className="text-base">Revenue Summary</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {[
                    { label: "Total Revenue",      value: fmtRev(totalRevenue),      color: "text-violet-700" },
                    { label: "This Month",          value: fmtRev(thisMonthRevenue),  color: "text-emerald-600" },
                    { label: "Paid Events",         value: myEvents.filter((ev) => (feeMap[ev.itemId] ?? 0) > 0).length, color: "text-slate-900" },
                    { label: "Free Events",         value: myEvents.filter((ev) => (feeMap[ev.itemId] ?? 0) === 0).length, color: "text-slate-900" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-4">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {myEvents.filter((ev) => (feeMap[ev.itemId] ?? 0) > 0).length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No paid events yet — revenue will appear once you create a paid event.</p>
                  ) : (
                    myEvents
                      .filter((ev) => (feeMap[ev.itemId] ?? 0) > 0)
                      .map((ev) => {
                        const fee   = feeMap[ev.itemId] ?? 0;
                        const regs  = getRegCount(ev.itemId);
                        const rev   = fee * regs;
                        return (
                          <div key={ev.id} className="flex items-center gap-3 text-sm">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 truncate">{ev.itemTitle}</p>
                              <p className="text-xs text-slate-400">₹{fee.toLocaleString("en-IN")} × {regs} registration{regs !== 1 ? "s" : ""}</p>
                            </div>
                            <span className="font-bold text-violet-700 shrink-0">₹{rev.toLocaleString("en-IN")}</span>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
