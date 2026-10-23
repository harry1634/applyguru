"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface User {
  id: string; name: string; email: string; image: string | null;
  provider: string; role: "participant" | "organizer" | "counselor";
  phone?: string; college?: string; orgName?: string;
  firstLoginAt: string; lastLoginAt: string; loginCount: number;
  stats?: { eventsAttended: number; applicationsSent: number; certificatesEarned: number; eventsCreated: number; jobsPosted: number };
}
interface ActivitySummary { eventsRegistered: number; eventsCreated: number; jobsApplied: number; jobsPosted: number }
type SortKey = "name" | "email" | "loginCount" | "lastLoginAt" | "eventsRegistered" | "eventsCreated" | "jobsApplied" | "jobsPosted" | "role";
type SortDir = "asc" | "desc";

const ROLE_COLORS: Record<string, string> = {
  participant: "bg-blue-100 text-blue-700",
  organizer:   "bg-violet-100 text-violet-700",
  counselor:   "bg-emerald-100 text-emerald-700",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function SortTh({ label, k, sort, dir, onSort }: { label: string; k: SortKey; sort: SortKey; dir: SortDir; onSort: (k: SortKey) => void }) {
  const active = sort === k;
  return (
    <th
      onClick={() => onSort(k)}
      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-slate-800 select-none"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={active ? "text-violet-500" : "text-slate-300"}>
          {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </span>
    </th>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]       = useState<User[]>([]);
  const [summaries, setSummaries] = useState<Record<string, ActivitySummary>>({});
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortKey, setSortKey]   = useState<SortKey>("lastLoginAt");
  const [sortDir, setSortDir]   = useState<SortDir>("desc");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [toast, setToast]       = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [usersRes, actsRes] = await Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/activities").then((r) => r.json()),
    ]);
    const usersData: User[] = usersRes.users ?? [];

    // Aggregate activity summaries per email
    const acts: { email: string; type: string }[] = actsRes.activities ?? [];
    const sums: Record<string, ActivitySummary> = {};
    for (const u of usersData) {
      const ua = acts.filter((a) => a.email === u.email);
      sums[u.email] = {
        eventsRegistered: ua.filter((a) => ["event-registered","workshop-enrolled","webinar-registered"].includes(a.type)).length,
        eventsCreated:    ua.filter((a) => a.type === "event-created").length,
        jobsApplied:      ua.filter((a) => a.type === "job-applied").length,
        jobsPosted:       ua.filter((a) => a.type === "job-posted").length,
      };
    }

    setUsers(usersData);
    setSummaries(sums);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRoleChange = async (user: User, role: User["role"]) => {
    await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email, role }) });
    setUsers((prev) => prev.map((u) => u.email === user.email ? { ...u, role } : u));
    showToast(`${user.name}'s role updated to ${role}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: deleteTarget.email }) });
    setUsers((prev) => prev.filter((u) => u.email !== deleteTarget.email));
    setDeleteTarget(null);
    showToast("User removed");
  };

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const getVal = (u: User, k: SortKey): string | number => {
    const s = summaries[u.email];
    switch (k) {
      case "loginCount":       return u.loginCount;
      case "lastLoginAt":      return u.lastLoginAt;
      case "eventsRegistered": return s?.eventsRegistered ?? 0;
      case "eventsCreated":    return s?.eventsCreated ?? 0;
      case "jobsApplied":      return s?.jobsApplied ?? 0;
      case "jobsPosted":       return s?.jobsPosted ?? 0;
      case "role":             return u.role;
      case "email":            return u.email;
      default:                 return u.name.toLowerCase();
    }
  };

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone ?? "").includes(q))
        && (filterRole === "all" || u.role === filterRole);
    })
    .sort((a, b) => {
      const av = getVal(a, sortKey), bv = getVal(b, sortKey);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const stats = {
    total:        users.length,
    participants: users.filter((u) => u.role === "participant").length,
    organizers:   users.filter((u) => u.role === "organizer").length,
    counselors:   users.filter((u) => u.role === "counselor").length,
  };

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
          <span className="font-semibold text-slate-800">Admin · Users</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/jobs"><Button variant="outline" size="sm">Jobs</Button></Link>
          <Link href="/admin/events"><Button variant="outline" size="sm">Events</Button></Link>
          <Button variant="outline" size="sm" onClick={fetchAll}>Refresh</Button>
          <Button variant="outline" size="sm" onClick={async () => {
            const res = await fetch("/api/users"); const data = await res.json();
            const blob = new Blob([JSON.stringify(data.users, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob); const a = document.createElement("a");
            a.href = url; a.download = "users.json"; a.click();
          }}>↓ Export</Button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registered Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">Click any column header to sort. All data is real-time from user activity.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users",  value: stats.total,        color: "text-slate-900" },
            { label: "Participants", value: stats.participants,  color: "text-blue-600" },
            { label: "Organizers",   value: stats.organizers,    color: "text-violet-600" },
            { label: "Counselors",   value: stats.counselors,    color: "text-emerald-600" },
          ].map((s) => (
            <Card key={s.label}><CardContent className="p-5">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </CardContent></Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone…"
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
            <option value="all">All roles</option>
            <option value="participant">Participants</option>
            <option value="organizer">Organizers</option>
            <option value="counselor">Counselors</option>
          </select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading users…</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">👤</p>
                <p className="font-semibold text-slate-800 mb-1">{users.length === 0 ? "No users yet" : "No users match your filter"}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-slate-50">
                    <SortTh label="User"          k="name"             {...thProps} />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">College / Org</th>
                    <SortTh label="Role"          k="role"             {...thProps} />
                    <SortTh label="Last Login"    k="lastLoginAt"      {...thProps} />
                    <SortTh label="Logins"        k="loginCount"       {...thProps} />
                    <SortTh label="Events Reg."   k="eventsRegistered" {...thProps} />
                    <SortTh label="Events Created"k="eventsCreated"    {...thProps} />
                    <SortTh label="Jobs Applied"  k="jobsApplied"      {...thProps} />
                    <SortTh label="Jobs Posted"   k="jobsPosted"       {...thProps} />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Profile</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => {
                    const s = summaries[user.email] ?? { eventsRegistered: 0, eventsCreated: 0, jobsApplied: 0, jobsPosted: 0 };
                    return (
                      <tr key={user.email} className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50 transition-colors">
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {user.image
                              ? <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full object-cover shrink-0" /> // eslint-disable-line @next/next/no-img-element
                              : <div className="h-8 w-8 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs shrink-0">{user.name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase()}</div>
                            }
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate text-xs">{user.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Phone */}
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{user.phone ?? <span className="text-slate-300">—</span>}</td>
                        {/* College / Org */}
                        <td className="px-4 py-3 text-xs text-slate-600 max-w-[120px] truncate">{(user as User & { orgName?: string }).orgName ?? user.college ?? <span className="text-slate-300">—</span>}</td>
                        {/* Role */}
                        <td className="px-4 py-3">
                          <select value={user.role} onChange={(e) => handleRoleChange(user, e.target.value as User["role"])}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${ROLE_COLORS[user.role]}`}>
                            <option value="participant">Participant</option>
                            <option value="organizer">Organizer</option>
                            <option value="counselor">Counselor</option>
                          </select>
                        </td>
                        {/* Last Login */}
                        <td className="px-4 py-3 text-[10px] text-slate-500 whitespace-nowrap">{fmt(user.lastLoginAt)}</td>
                        {/* Login count */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-xs font-bold text-slate-700">{user.loginCount}</span>
                        </td>
                        {/* Events Registered */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full text-xs font-bold ${s.eventsRegistered > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>{s.eventsRegistered}</span>
                        </td>
                        {/* Events Created */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full text-xs font-bold ${s.eventsCreated > 0 ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-400"}`}>{s.eventsCreated}</span>
                        </td>
                        {/* Jobs Applied */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full text-xs font-bold ${s.jobsApplied > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{s.jobsApplied}</span>
                        </td>
                        {/* Jobs Posted */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full text-xs font-bold ${s.jobsPosted > 0 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-400"}`}>{s.jobsPosted}</span>
                        </td>
                        {/* Profile */}
                        <td className="px-4 py-3">
                          <Link href={`/admin/users/${encodeURIComponent(user.email)}`} className="text-xs text-violet-600 hover:text-violet-800 font-semibold transition-colors">View →</Link>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <button onClick={() => setDeleteTarget(user)} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <p className="text-xs text-slate-400 text-center">Data stored in <code className="bg-slate-100 px-1 rounded">data/users.json</code> and <code className="bg-slate-100 px-1 rounded">data/activities.json</code></p>
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Remove user?</h3>
            <p className="text-sm text-slate-500 mb-5"><span className="font-semibold text-slate-700">{deleteTarget.name}</span> ({deleteTarget.email}) will be removed. They can sign in again.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>Remove</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
