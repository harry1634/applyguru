"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StoredJob {
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
  duration: string;
  openings: string;
  deadline: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  perks: string;
  status: "published" | "draft";
  createdAt: string;
}

interface Activity {
  id: string; email: string; type: string;
  itemId: string; itemTitle: string; itemDetails?: string; timestamp: string;
}
interface StoredUser {
  name: string; email: string; image: string | null;
  phone?: string; college?: string; orgName?: string; role: string;
}

function fmt(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTs(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const TYPE_BADGE: Record<string, string> = {
  "Full-time":  "bg-blue-100 text-blue-700",
  "Internship": "bg-purple-100 text-purple-700",
  "Part-time":  "bg-yellow-100 text-yellow-700",
  "Remote":     "bg-emerald-100 text-emerald-700",
  "Government": "bg-orange-100 text-orange-700",
  "Freelance":  "bg-pink-100 text-pink-700",
};

export default function AdminJobDetailPage({ params }: { params: { id: string } }) {
  const [job,        setJob]        = useState<StoredJob | null>(null);
  const [applicants, setApplicants] = useState<(Activity & { user?: StoredUser })[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);

  const fetchData = useCallback(async () => {
    const { id } = params;
    try {
      const [jData, actData, usersData] = await Promise.all([
        fetch(`/api/jobs?id=${id}`).then((r) => r.json()),
        fetch(`/api/activities?itemId=${id}`).then((r) => r.json()),
        fetch("/api/users").then((r) => r.json()),
      ]);

      if (!jData.job) { setNotFound(true); return; }
      setJob(jData.job);

      const apps: Activity[] = (actData.activities ?? []).filter((a: Activity) => a.type === "job-applied");

      const usersMap: Record<string, StoredUser> = {};
      for (const u of (usersData.users ?? [])) usersMap[u.email] = u;

      setApplicants(apps.map((a) => ({ ...a, user: usersMap[a.email] })));
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 sticky top-0 z-30">
        <div className="h-5 w-48 bg-slate-100 rounded animate-pulse" />
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  if (notFound || !job) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <p className="text-5xl">🔍</p>
      <h1 className="text-xl font-bold text-slate-800">Job not found</h1>
      <Link href="/admin/jobs"><Button variant="outline">← Back to Jobs</Button></Link>
    </div>
  );

  const salary = job.jobType === "Internship"
    ? (job.stipend ? `₹${Number(job.stipend).toLocaleString("en-IN")}/month` : "Negotiable")
    : job.minSalary && job.maxSalary
    ? `${Math.round(Number(job.minSalary) / 100000)}–${Math.round(Number(job.maxSalary) / 100000)} LPA`
    : job.minSalary
    ? `${Math.round(Number(job.minSalary) / 100000)}+ LPA`
    : "Negotiable";

  const infoCells = [
    { label: "Company",     value: job.company },
    { label: "Organizer",   value: job.organizerName },
    { label: "Org. Email",  value: job.organizerEmail },
    { label: "Job Type",    value: job.jobType },
    { label: "Work Mode",   value: job.workMode },
    { label: "Location",    value: job.location || "Remote" },
    { label: "Salary",      value: salary },
    { label: "Openings",    value: job.openings || "—" },
    ...(job.department ? [{ label: "Department", value: job.department }] : []),
    ...(job.duration   ? [{ label: "Duration",   value: job.duration   }] : []),
    { label: "Deadline",    value: job.deadline ? fmt(job.deadline) : "—" },
    { label: "Status",      value: job.status },
    { label: "Posted",      value: fmtTs(job.createdAt) },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard">
            <div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">AG</span>
            </div>
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/admin/users" className="text-sm text-slate-500 hover:text-slate-800 hidden sm:block">Admin</Link>
          <span className="text-slate-300 hidden sm:block">/</span>
          <Link href="/admin/jobs" className="text-sm text-slate-500 hover:text-slate-800">Jobs</Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800 truncate text-sm">{job.title}</span>
        </div>
        <Link href="/admin/jobs"><Button variant="outline" size="sm">← Jobs</Button></Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Applicants", value: applicants.length, color: "text-slate-900",   sub: job.openings ? `${job.openings} openings` : "openings not specified" },
            { label: "Job Type",         value: job.jobType,       color: "text-violet-600",  sub: job.workMode },
            { label: "Salary",           value: salary,             color: "text-emerald-600", sub: job.jobType === "Internship" ? "per month stipend" : "per annum" },
            { label: "Status",           value: job.status,         color: job.status === "published" ? "text-emerald-600" : "text-slate-500", sub: `Posted ${fmt(job.createdAt)}` },
          ].map((s) => (
            <Card key={s.label}><CardContent className="p-5">
              <p className={`text-lg font-bold capitalize ${s.color}`}>{s.value}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.sub}</p>
            </CardContent></Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Job info */}
          <Card className="lg:col-span-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💼</span>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm leading-tight">{job.title}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${TYPE_BADGE[job.jobType] ?? "bg-slate-100 text-slate-600"}`}>{job.jobType}</span>
                </div>
              </div>

              {job.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-slate-400 font-medium mb-1.5">SKILLS</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.map((s) => (
                      <span key={s} className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {infoCells.map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-400 shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-slate-700 text-right break-all max-w-[55%]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link
                  href={`/jobs/${job.id}`}
                  className="w-full block text-center text-xs text-violet-600 hover:text-violet-800 font-semibold py-2 rounded-lg border border-violet-200 hover:bg-violet-50 transition-colors"
                >
                  View Public Listing →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Applicants */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="font-bold text-slate-900">Applicants ({applicants.length})</h2>
                  <p className="text-xs text-slate-400 mt-0.5">All users who applied for this position</p>
                </div>
                {applicants.length > 0 && (
                  <button
                    onClick={() => {
                      const csv = [
                        "Name,Email,Phone,College/Org,Applied At",
                        ...applicants.map((a) =>
                          `"${a.user?.name ?? "Unknown"}","${a.email}","${a.user?.phone ?? ""}","${a.user?.college ?? a.user?.orgName ?? ""}","${fmtTs(a.timestamp)}"`
                        ),
                      ].join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const el = document.createElement("a");
                      el.href = URL.createObjectURL(blob);
                      el.download = `${job.title}-applicants.csv`;
                      el.click();
                    }}
                    className="text-xs text-violet-600 hover:text-violet-800 font-semibold"
                  >
                    ↓ Export CSV
                  </button>
                )}
              </div>

              {applicants.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-3xl mb-2">👥</p>
                  <p className="text-sm font-semibold text-slate-700">No applicants yet</p>
                  <p className="text-xs text-slate-400 mt-1">Users will appear here once they apply</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applicants.map((a, i) => (
                    <div key={a.id} className="px-5 py-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                      <span className="text-xs text-slate-400 font-medium w-5 shrink-0 pt-1">{i + 1}</span>

                      {a.user?.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={a.user.image} alt={a.user.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
                        : <div className="h-9 w-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(a.user?.name ?? a.email).slice(0, 2).toUpperCase()}
                          </div>
                      }

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{a.user?.name ?? "—"}</p>
                        <p className="text-xs text-slate-500 truncate">{a.email}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-slate-400">
                          {a.user?.phone  && <span>📞 {a.user.phone}</span>}
                          {(a.user?.college ?? a.user?.orgName) && <span>🏫 {a.user?.college ?? a.user?.orgName}</span>}
                          <span>📅 Applied {fmtTs(a.timestamp)}</span>
                        </div>
                      </div>

                      <Link
                        href={`/admin/users/${encodeURIComponent(a.email)}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-center transition-colors shrink-0"
                      >
                        Profile
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
