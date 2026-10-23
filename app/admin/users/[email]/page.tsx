"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StoredUser {
  id: string; name: string; email: string; image: string | null;
  provider: string; role: "participant" | "organizer" | "counselor";
  phone?: string; college?: string; degree?: string; graduationYear?: string;
  username?: string; city?: string; state?: string;
  orgName?: string; orgType?: string; orgContact?: string; orgWebsite?: string;
  expertise?: string; experience?: string; designation?: string; linkedIn?: string;
  userType?: string;
  firstLoginAt: string; lastLoginAt: string; loginCount: number;
  stats?: { eventsAttended: number; applicationsSent: number; certificatesEarned: number; eventsCreated: number; jobsPosted: number };
}

interface Activity {
  id: string; email: string; type: string;
  itemId: string; itemTitle: string; itemDetails?: string; timestamp: string;
}

interface StoredEvent {
  id: string; title: string; type: string; category: string;
  mode: string; date: string; time: string; location: string;
  fee: string; capacity: string; status: string;
  organizerName: string; organizerEmail: string; createdAt: string;
}

interface StoredJob {
  id: string; title: string; company: string; jobType: string;
  minSalary: string; maxSalary: string; stipend: string;
  openings: string; deadline: string; status: string;
  organizerName: string; organizerEmail: string; createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  participant: "bg-blue-100 text-blue-700",
  organizer:   "bg-violet-100 text-violet-700",
  counselor:   "bg-emerald-100 text-emerald-700",
};

const TYPE_ICON: Record<string, string> = {
  "event-created":      "📅",
  "event-registered":   "🎟️",
  "workshop-enrolled":  "🔧",
  "webinar-registered": "📹",
  "job-applied":        "💼",
  "job-posted":         "📋",
};

function fmt(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTs(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminUserDetailPage({ params }: { params: { email: string } }) {
  const email = decodeURIComponent(params.email);

  const [user,       setUser]       = useState<StoredUser | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [eventMap,   setEventMap]   = useState<Record<string, StoredEvent>>({});
  const [jobMap,     setJobMap]     = useState<Record<string, StoredJob>>({});
  const [regCounts,  setRegCounts]  = useState<Record<string, number>>({});
  const [appCounts,  setAppCounts]  = useState<Record<string, number>>({});
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users?email=${encodeURIComponent(email)}`).then((r) => r.json()),
      fetch(`/api/activities?email=${encodeURIComponent(email)}`).then((r) => r.json()),
      fetch("/api/events?all=true").then((r) => r.json()),
      fetch("/api/activities").then((r) => r.json()),
      fetch("/api/jobs?all=true").then((r) => r.json()),
    ]).then(([uData, actData, evData, allActsData, jobData]) => {
      if (!uData.user) { setNotFound(true); return; }
      setUser(uData.user);

      const acts: Activity[] = actData.activities ?? [];
      setActivities(acts.sort((a: Activity, b: Activity) => b.timestamp.localeCompare(a.timestamp)));

      const evs: StoredEvent[] = evData.events ?? [];
      const eMap: Record<string, StoredEvent> = {};
      for (const ev of evs) eMap[ev.id] = ev;
      setEventMap(eMap);

      const jobs: StoredJob[] = jobData.jobs ?? [];
      const jMap: Record<string, StoredJob> = {};
      for (const j of jobs) jMap[j.id] = j;
      setJobMap(jMap);

      const allActs: Activity[] = allActsData.activities ?? [];

      // Count registrations per event
      const eCounts: Record<string, number> = {};
      for (const a of allActs) {
        if (["event-registered", "workshop-enrolled", "webinar-registered"].includes(a.type)) {
          eCounts[a.itemId] = (eCounts[a.itemId] ?? 0) + 1;
        }
      }
      setRegCounts(eCounts);

      // Count applicants per job
      const jCounts: Record<string, number> = {};
      for (const a of allActs) {
        if (a.type === "job-applied") jCounts[a.itemId] = (jCounts[a.itemId] ?? 0) + 1;
      }
      setAppCounts(jCounts);
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--muted)]">
      <header className="h-16 border-b border-[var(--border)] bg-white flex items-center px-6 sticky top-0 z-30">
        <div className="h-5 w-48 bg-slate-100 rounded animate-pulse" />
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  if (notFound || !user) return (
    <div className="min-h-screen bg-[var(--muted)] flex flex-col items-center justify-center gap-4">
      <p className="text-5xl">👤</p>
      <h1 className="text-xl font-bold text-slate-800">User not found</h1>
      <Link href="/admin/users"><Button variant="outline">← Back to Users</Button></Link>
    </div>
  );

  // Separate activity types
  const createdActs    = activities.filter((a) => a.type === "event-created");
  const registeredActs = activities.filter((a) => ["event-registered", "workshop-enrolled", "webinar-registered"].includes(a.type));
  const jobPostedActs  = activities.filter((a) => a.type === "job-posted");
  const jobAppliedActs = activities.filter((a) => a.type === "job-applied");
  const otherActs      = activities.filter((a) =>
    !["event-created", "event-registered", "workshop-enrolled", "webinar-registered", "job-posted", "job-applied"].includes(a.type)
  );

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const profileRows: [string, string | number | undefined][] = user.role === "organizer" ? [
    ["Organisation", user.orgName],
    ["Org. Type",    user.orgType],
    ["Contact",      user.orgContact],
    ["Website",      user.orgWebsite],
    ["City",         user.city],
    ["State",        user.state],
  ] : user.role === "counselor" ? [
    ["Expertise",   user.expertise],
    ["Experience",  user.experience],
    ["Designation", user.designation],
    ["LinkedIn",    user.linkedIn],
    ["City",        user.city],
    ["State",       user.state],
  ] : [
    ["Username",    user.username],
    ["College",     user.college],
    ["Degree",      user.degree],
    ["Grad. Year",  user.graduationYear],
    ["City",        user.city],
    ["State",       user.state],
  ];

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      <header className="h-16 border-b border-[var(--border)] bg-white flex items-center px-6 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard"><div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center shrink-0"><span className="text-white font-bold text-sm">AG</span></div></Link>
          <span className="text-slate-300">/</span>
          <Link href="/admin/users" className="text-sm text-slate-500 hover:text-slate-800">Admin · Users</Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800 truncate text-sm">{user.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/jobs"><Button variant="outline" size="sm">Jobs</Button></Link>
          <Link href="/admin/events"><Button variant="outline" size="sm">Events</Button></Link>
          <Link href="/admin/users"><Button variant="outline" size="sm">← Users</Button></Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* User profile card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Avatar */}
              {user.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={user.image} alt={user.name} className="h-16 w-16 rounded-2xl object-cover shrink-0" />
                : <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-xl shrink-0">{initials}</div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
                {user.phone && <p className="text-sm text-slate-500">{user.phone}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  <span className="text-xs text-slate-400">Provider: <strong className="text-slate-600">{user.provider}</strong></span>
                  <span className="text-xs text-slate-400">Logins: <strong className="text-slate-600">{user.loginCount}</strong></span>
                  <span className="text-xs text-slate-400">First login: <strong className="text-slate-600">{fmt(user.firstLoginAt)}</strong></span>
                  <span className="text-xs text-slate-400">Last login: <strong className="text-slate-600">{fmt(user.lastLoginAt)}</strong></span>
                </div>
              </div>
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2 shrink-0">
                {[
                  { label: "Events Created",  value: createdActs.length,    color: "text-violet-600" },
                  { label: "Registered",       value: registeredActs.length, color: "text-blue-600" },
                  { label: "Jobs Applied",     value: jobAppliedActs.length, color: "text-emerald-600" },
                  { label: "Jobs Posted",      value: jobPostedActs.length,  color: "text-orange-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center min-w-[80px]">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile details */}
            <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2">
              {profileRows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="py-1">
                  <span className="text-[10px] text-slate-400 font-medium block">{k}</span>
                  <span className="text-xs font-semibold text-slate-700 break-all">{v}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events created by this organizer */}
        {createdActs.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-bold text-slate-900">Events Created ({createdActs.length})</h2>
                <p className="text-xs text-slate-400 mt-0.5">Events published by this organizer, with registration count and fee</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Event</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Reg. Fee</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Capacity</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Registrations</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdActs.map((a) => {
                      const ev       = eventMap[a.itemId];
                      const fee      = ev ? (parseInt(ev.fee) || 0) : 0;
                      const capacity = ev ? (parseInt(ev.capacity) || 0) : 0;
                      const regs     = regCounts[a.itemId] ?? 0;
                      const revenue  = fee * regs;

                      return (
                        <tr key={a.id} className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 max-w-[200px]">
                            <p className="text-xs font-semibold text-slate-800 truncate">{a.itemTitle}</p>
                            <p className="text-[10px] text-slate-400">{ev?.type ?? ""} · {ev?.status ?? ""}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{ev ? fmt(ev.date) : "—"}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{ev?.mode ?? "—"}</td>
                          <td className="px-4 py-3 text-xs font-bold whitespace-nowrap">
                            {ev
                              ? fee === 0
                                ? <span className="text-emerald-600">Free</span>
                                : <span className="text-slate-800">₹{fee.toLocaleString("en-IN")}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 text-center">{capacity > 0 ? capacity : "∞"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold ${regs > 0 ? "text-blue-700" : "text-slate-400"}`}>{regs}</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold whitespace-nowrap">
                            {fee > 0
                              ? <span className="text-violet-700">₹{revenue.toLocaleString("en-IN")}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/admin/events/${a.itemId}`} className="text-xs text-violet-600 hover:text-violet-800 font-semibold">View →</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events registered by this participant */}
        {registeredActs.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-bold text-slate-900">Events Registered ({registeredActs.length})</h2>
                <p className="text-xs text-slate-400 mt-0.5">Events this user signed up for, including amount paid</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Event</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Organizer</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Amount Paid</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Registered At</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredActs.map((a) => {
                      const ev  = eventMap[a.itemId];
                      const fee = ev ? (parseInt(ev.fee) || 0) : 0;

                      return (
                        <tr key={a.id} className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 max-w-[180px]">
                            <p className="text-xs font-semibold text-slate-800 truncate">{a.itemTitle}</p>
                            <p className="text-[10px] text-slate-400">{ev?.type ?? ""}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 max-w-[120px] truncate">{ev?.organizerName ?? "—"}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{ev ? fmt(ev.date) : "—"}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{ev?.mode ?? "—"}</td>
                          <td className="px-4 py-3 text-xs font-bold whitespace-nowrap">
                            {ev
                              ? fee === 0
                                ? <span className="text-emerald-600">Free</span>
                                : <span className="text-slate-800">₹{fee.toLocaleString("en-IN")}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-[10px] text-slate-500 whitespace-nowrap">{fmtTs(a.timestamp)}</td>
                          <td className="px-4 py-3">
                            <Link href={`/admin/events/${a.itemId}`} className="text-xs text-violet-600 hover:text-violet-800 font-semibold">View →</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jobs posted by this organizer */}
        {jobPostedActs.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-bold text-slate-900">Jobs Posted ({jobPostedActs.length})</h2>
                <p className="text-xs text-slate-400 mt-0.5">Job listings published by this organizer, with applicant counts</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Job</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Salary</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadline</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Applicants</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobPostedActs.map((a) => {
                      const job  = jobMap[a.itemId];
                      const apps = appCounts[a.itemId] ?? 0;
                      const salary = !job ? "—"
                        : job.jobType === "Internship"
                        ? (job.stipend ? `₹${Number(job.stipend).toLocaleString("en-IN")}/mo` : "Negotiable")
                        : job.minSalary && job.maxSalary
                        ? `${Math.round(Number(job.minSalary) / 100000)}–${Math.round(Number(job.maxSalary) / 100000)} LPA`
                        : job.minSalary
                        ? `${Math.round(Number(job.minSalary) / 100000)}+ LPA`
                        : "Negotiable";

                      return (
                        <tr key={a.id} className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 max-w-[200px]">
                            <p className="text-xs font-semibold text-slate-800 truncate">{a.itemTitle}</p>
                            <p className="text-[10px] text-slate-400">{job?.company ?? ""}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">{job?.jobType ?? "—"}</td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-700 whitespace-nowrap">{salary}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{job?.deadline ? fmt(job.deadline) : "—"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold ${apps > 0 ? "text-blue-700" : "text-slate-400"}`}>{apps}</span>
                          </td>
                          <td className="px-4 py-3">
                            {job
                              ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${job.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{job.status}</span>
                              : <span className="text-slate-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/admin/jobs/${a.itemId}`} className="text-xs text-violet-600 hover:text-violet-800 font-semibold">View →</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jobs applied by this participant */}
        {jobAppliedActs.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-bold text-slate-900">Jobs Applied ({jobAppliedActs.length})</h2>
                <p className="text-xs text-slate-400 mt-0.5">Job positions this user has applied for</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Job</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Salary</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Applied At</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobAppliedActs.map((a) => {
                      const job = jobMap[a.itemId];
                      const salary = !job ? "—"
                        : job.jobType === "Internship"
                        ? (job.stipend ? `₹${Number(job.stipend).toLocaleString("en-IN")}/mo` : "Negotiable")
                        : job.minSalary && job.maxSalary
                        ? `${Math.round(Number(job.minSalary) / 100000)}–${Math.round(Number(job.maxSalary) / 100000)} LPA`
                        : job.minSalary
                        ? `${Math.round(Number(job.minSalary) / 100000)}+ LPA`
                        : "Negotiable";

                      return (
                        <tr key={a.id} className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 max-w-[180px]">
                            <p className="text-xs font-semibold text-slate-800 truncate">{a.itemTitle}</p>
                            <p className="text-[10px] text-slate-400">{job?.jobType ?? ""}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 max-w-[120px] truncate">{job?.company ?? "—"}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{job?.jobType ?? "—"}</td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-700 whitespace-nowrap">{salary}</td>
                          <td className="px-4 py-3 text-[10px] text-slate-500 whitespace-nowrap">{fmtTs(a.timestamp)}</td>
                          <td className="px-4 py-3">
                            <Link href={`/admin/jobs/${a.itemId}`} className="text-xs text-violet-600 hover:text-violet-800 font-semibold">View →</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity timeline — shows remaining events + any unclassified */}
        {(otherActs.length > 0 || (createdActs.length === 0 && registeredActs.length === 0 && jobPostedActs.length === 0 && jobAppliedActs.length === 0)) && (
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-bold text-slate-900">Activity Timeline</h2>
              </div>
              {activities.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm font-semibold text-slate-700">No activity recorded yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {activities.map((a) => (
                    <div key={a.id} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                      <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[a.type] ?? "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{a.itemTitle}</p>
                        <p className="text-[10px] text-slate-400">{a.type.replace(/-/g, " ")} {a.itemDetails ? `· ${a.itemDetails}` : ""}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{fmtTs(a.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
