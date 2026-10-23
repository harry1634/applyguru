"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdminJob {
  id: string;
  organizerEmail: string;
  organizerName: string;
  title: string;
  company: string;
  jobType: string;
  department: string;
  workMode: string;
  location: string;
  minSalary: string;
  maxSalary: string;
  stipend: string;
  openings: string;
  deadline: string;
  skills: string[];
  status: "published" | "draft";
  createdAt: string;
}

interface Activity { email: string; type: string; itemId: string; }

type SortKey = "title" | "company" | "organizerName" | "jobType" | "deadline" | "applicants" | "status" | "createdAt";
type SortDir = "asc" | "desc";

const TYPE_BADGE: Record<string, string> = {
  "Full-time":  "bg-blue-100 text-blue-700",
  "Internship": "bg-purple-100 text-purple-700",
  "Part-time":  "bg-yellow-100 text-yellow-700",
  "Remote":     "bg-emerald-100 text-emerald-700",
  "Government": "bg-orange-100 text-orange-700",
  "Freelance":  "bg-pink-100 text-pink-700",
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

export default function AdminJobsPage() {
  const [jobs,         setJobs]         = useState<AdminJob[]>([]);
  const [appCounts,    setAppCounts]    = useState<Record<string, number>>({});
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType,   setFilterType]   = useState("all");
  const [sortKey,      setSortKey]      = useState<SortKey>("createdAt");
  const [sortDir,      setSortDir]      = useState<SortDir>("desc");
  const [toast,        setToast]        = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  void showToast;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [jRes, actRes] = await Promise.all([
      fetch("/api/jobs?all=true").then((r) => r.json()),
      fetch("/api/activities").then((r) => r.json()),
    ]);

    const allJobs: AdminJob[] = jRes.jobs ?? [];
    const acts: Activity[]    = actRes.activities ?? [];

    const counts: Record<string, number> = {};
    for (const a of acts) {
      if (a.type === "job-applied") counts[a.itemId] = (counts[a.itemId] ?? 0) + 1;
    }

    setJobs(allJobs);
    setAppCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  };

  const getVal = (j: AdminJob, k: SortKey): string | number => {
    switch (k) {
      case "applicants":    return appCounts[j.id] ?? 0;
      case "deadline":      return j.deadline;
      case "createdAt":     return j.createdAt;
      case "status":        return j.status;
      case "jobType":       return j.jobType.toLowerCase();
      case "company":       return j.company.toLowerCase();
      case "organizerName": return j.organizerName.toLowerCase();
      default:              return j.title.toLowerCase();
    }
  };

  const jobTypes = Array.from(new Set(jobs.map((j) => j.jobType))).sort();

  const filtered = jobs
    .filter((j) => {
      const q = search.toLowerCase();
      const matchQ      = j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.organizerName.toLowerCase().includes(q) || j.organizerEmail.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || j.status === filterStatus;
      const matchType   = filterType   === "all" || j.jobType === filterType;
      return matchQ && matchStatus && matchType;
    })
    .sort((a, b) => {
      const av = getVal(a, sortKey), bv = getVal(b, sortKey);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalApps = Object.values(appCounts).reduce((s, n) => s + n, 0);
  const thProps = { sort: sortKey, dir: sortDir, onSort: handleSort };

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg">✅ {toast}</div>
      )}

      <header className="h-16 border-b border-[var(--border)] bg-white flex items-center px-6 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AG</span>
            </div>
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/admin/users" className="text-sm text-slate-500 hover:text-slate-800">Admin · Users</Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Jobs</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/events"><Button variant="outline" size="sm">Events</Button></Link>
          <Link href="/admin/users"><Button variant="outline" size="sm">Users</Button></Link>
          <Button variant="outline" size="sm" onClick={fetchAll}>Refresh</Button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Jobs</h1>
          <p className="text-slate-500 text-sm mt-0.5">Click any column header to sort. Click a job title to see applicant details.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Jobs",       value: jobs.length,                                        color: "text-slate-900" },
            { label: "Published",        value: jobs.filter((j) => j.status === "published").length, color: "text-emerald-600" },
            { label: "Total Applicants", value: totalApps,                                           color: "text-blue-600" },
            { label: "Avg. Applicants",  value: jobs.length ? Math.round(totalApps / jobs.length) : 0, color: "text-violet-600" },
          ].map((s) => (
            <Card key={s.label}><CardContent className="p-5">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value.toLocaleString("en-IN")}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </CardContent></Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, company, organizer, email…"
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
          />
          <select
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
          >
            <option value="all">All types</option>
            {jobTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading jobs…</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">💼</p>
                <p className="font-semibold text-slate-800 mb-1">{jobs.length === 0 ? "No jobs yet" : "No jobs match your filter"}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-slate-50">
                    <SortTh label="Job"         k="title"         {...thProps} />
                    <SortTh label="Company"      k="company"       {...thProps} />
                    <SortTh label="Organizer"    k="organizerName" {...thProps} />
                    <SortTh label="Type"         k="jobType"       {...thProps} />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Salary</th>
                    <SortTh label="Deadline"     k="deadline"      {...thProps} />
                    <SortTh label="Applicants"   k="applicants"    {...thProps} />
                    <SortTh label="Status"       k="status"        {...thProps} />
                    <SortTh label="Posted"       k="createdAt"     {...thProps} />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => {
                    const apps = appCounts[job.id] ?? 0;
                    const salary = job.jobType === "Internship"
                      ? (job.stipend ? `₹${Number(job.stipend).toLocaleString("en-IN")}/mo` : "Negotiable")
                      : job.minSalary && job.maxSalary
                      ? `${Math.round(Number(job.minSalary) / 100000)}–${Math.round(Number(job.maxSalary) / 100000)} LPA`
                      : job.minSalary
                      ? `${Math.round(Number(job.minSalary) / 100000)}+ LPA`
                      : "Negotiable";

                    return (
                      <tr key={job.id} className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 max-w-[220px]">
                          <Link href={`/admin/jobs/${job.id}`} className="font-semibold text-slate-900 hover:text-violet-700 transition-colors text-xs leading-tight line-clamp-2 block">
                            {job.title}
                          </Link>
                          {job.department && <p className="text-[10px] text-slate-400 mt-0.5">{job.department}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-700 max-w-[130px] truncate">{job.company}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">{job.organizerName}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{job.organizerEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[job.jobType] ?? "bg-slate-100 text-slate-600"}`}>{job.jobType}</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold whitespace-nowrap text-slate-700">{salary}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{job.deadline ? fmt(job.deadline) : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${apps > 0 ? "text-blue-700" : "text-slate-400"}`}>{apps}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[job.status]}`}>{job.status}</span>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-slate-400 whitespace-nowrap">{fmt(job.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/jobs/${job.id}`} className="text-xs text-violet-600 hover:text-violet-800 font-semibold transition-colors">
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
          Data from <code className="bg-slate-100 px-1 rounded">data/jobs.json</code> and <code className="bg-slate-100 px-1 rounded">data/activities.json</code>
        </p>
      </div>
    </div>
  );
}
