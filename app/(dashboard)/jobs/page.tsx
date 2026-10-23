"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { JobCardSkeleton } from "@/components/ui/skeleton";
import type { StoredJob } from "@/lib/job-store";

const jobTypes = ["All", "Full-time", "Internship", "Part-time", "Remote", "Government", "Freelance"];
const experience = ["All", "Fresher", "0–1 yr", "1–3 yrs", "3–5 yrs", "5+ yrs"];

function storedJobToCard(job: StoredJob) {
  const salary =
    job.jobType === "Internship"
      ? job.stipend
        ? `₹${Number(job.stipend).toLocaleString("en-IN")}/month`
        : "Negotiable"
      : job.minSalary && job.maxSalary
      ? `${Math.round(Number(job.minSalary) / 100000)}–${Math.round(Number(job.maxSalary) / 100000)} LPA`
      : job.minSalary
      ? `${Math.round(Number(job.minSalary) / 100000)}+ LPA`
      : "Negotiable";

  const diffH = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / 3600000);
  const posted = diffH < 1 ? "Just now" : diffH < 24 ? `${diffH}h ago` : `${Math.floor(diffH / 24)}d ago`;

  const modeMap: Record<string, string> = { Remote: "Remote", "On-site": "Offline", Hybrid: "Hybrid" };

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    logo: "💼",
    location: job.location || "Remote",
    mode: modeMap[job.workMode] ?? "Remote",
    type: job.jobType,
    salary,
    exp: "Fresher",
    posted,
    tags: job.skills.slice(0, 3),
    urgent: false,
    govt: false,
  };
}

const mockJobs = [
  { id: "1",  title: "Software Engineer – Frontend",       company: "Swiggy",          logo: "🧡", location: "Bengaluru",  mode: "Hybrid",  type: "Full-time",   salary: "18–28 LPA", exp: "1–3 yrs",  posted: "2h ago",     tags: ["React","TypeScript","Next.js"],     urgent: true,  govt: false },
  { id: "2",  title: "Data Science Intern",                company: "Zomato",           logo: "🔴", location: "Gurugram",   mode: "Hybrid",  type: "Internship",  salary: "₹40K/month",exp: "Fresher",  posted: "5h ago",     tags: ["Python","ML","SQL"],                urgent: false, govt: false },
  { id: "3",  title: "SSC CGL 2025 – Graduate Level",     company: "Staff Selection Commission", logo: "🇮🇳", location: "Pan India", mode: "Offline", type: "Government", salary: "₹35–50K/month", exp: "Fresher", posted: "1d ago", tags: ["Government","SSC","Exam"],          urgent: true,  govt: true },
  { id: "4",  title: "Product Manager",                   company: "PhonePe",          logo: "💜", location: "Bengaluru",  mode: "Hybrid",  type: "Full-time",   salary: "30–45 LPA", exp: "3–5 yrs",  posted: "1d ago",     tags: ["Product","Analytics","Strategy"],   urgent: false, govt: false },
  { id: "5",  title: "UI/UX Designer",                    company: "Razorpay",         logo: "🔵", location: "Bengaluru",  mode: "Remote",  type: "Full-time",   salary: "12–20 LPA", exp: "1–3 yrs",  posted: "2d ago",     tags: ["Figma","Design","Prototyping"],     urgent: false, govt: false },
  { id: "6",  title: "DevOps Engineer Intern",            company: "Amazon",           logo: "🟡", location: "Hyderabad",  mode: "Hybrid",  type: "Internship",  salary: "₹60K/month",exp: "Fresher",  posted: "2d ago",     tags: ["AWS","Docker","CI/CD"],             urgent: false, govt: false },
  { id: "7",  title: "UPSC Civil Services 2025",          company: "UPSC India",       logo: "🏛️",  location: "Pan India", mode: "Offline", type: "Government", salary: "₹56–250K/month", exp: "Fresher", posted: "3d ago", tags: ["Government","IAS","Civil Services"], urgent: false, govt: true },
  { id: "8",  title: "Backend Engineer – Go",             company: "Dunzo",            logo: "🟢", location: "Bengaluru",  mode: "Hybrid",  type: "Full-time",   salary: "20–32 LPA", exp: "1–3 yrs",  posted: "3d ago",     tags: ["Go","PostgreSQL","Microservices"],  urgent: false, govt: false },
  { id: "9",  title: "Content Writer – Tech",             company: "GeeksforGeeks",    logo: "✏️",  location: "Noida",     mode: "Remote",  type: "Part-time",   salary: "₹20–35K/month", exp: "Fresher", posted: "4d ago",  tags: ["Writing","Tech","SEO"],             urgent: false, govt: false },
  { id: "10", title: "Machine Learning Engineer",         company: "NVIDIA India",     logo: "🟩", location: "Pune",       mode: "Hybrid",  type: "Full-time",   salary: "35–55 LPA", exp: "3–5 yrs",  posted: "5d ago",     tags: ["ML","Deep Learning","CUDA"],        urgent: false, govt: false },
  { id: "11", title: "Bank PO – IBPS 2025",              company: "IBPS",             logo: "🏦", location: "Pan India",  mode: "Offline", type: "Government", salary: "₹29–49K/month", exp: "Fresher", posted: "1w ago",  tags: ["Banking","IBPS","Government"],      urgent: true,  govt: true },
  { id: "12", title: "React Native Developer",            company: "MakeMyTrip",       logo: "✈️",  location: "Gurugram",  mode: "Hybrid",  type: "Full-time",   salary: "15–22 LPA", exp: "1–3 yrs",  posted: "1w ago",     tags: ["React Native","Mobile","iOS"],      urgent: false, govt: false },
];

export default function JobsPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [activeExp, setActiveExp] = useState("All");
  const [showGovt, setShowGovt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [appliedActivityIdMap, setAppliedActivityIdMap] = useState<Map<string, string>>(new Map());
  const [realJobs, setRealJobs] = useState<ReturnType<typeof storedJobToCard>[]>([]);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then(({ jobs }) => setRealJobs((jobs ?? []).map(storedJobToCard)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    fetch(`/api/activities?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then(({ activities }) => {
        const applied = (activities ?? []).filter((a: { type: string }) => a.type === "job-applied");
        setAppliedJobIds(new Set<string>(applied.map((a: { itemId: string }) => a.itemId)));
        setAppliedActivityIdMap(new Map<string, string>(applied.map((a: { id: string; itemId: string }) => [a.itemId, a.id])));
      })
      .catch(() => {});
  }, [session?.user?.email]);

  // Real jobs shown first, then mock jobs
  const allJobs = [...realJobs, ...mockJobs];

  const filtered = allJobs.filter((j) => {
    const matchType   = activeType === "All" || j.type === activeType;
    const matchExp    = activeExp  === "All" || j.exp  === activeExp;
    const matchGovt   = !showGovt || j.govt;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
                        j.company.toLowerCase().includes(search.toLowerCase()) ||
                        j.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchExp && matchGovt && matchSearch;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Jobs & Internships</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-0.5">
            {allJobs.length}+ opportunities — private, startup & government
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGovt(!showGovt)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              showGovt
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:border-orange-400"
            }`}
          >
            🏛️ Govt Jobs {showGovt && "✓"}
          </button>
          <Button variant="gradient" size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Job Alerts
          </Button>
        </div>
      </div>

      {/* Search */}
      <Input
        type="search"
        placeholder="Search job title, company, skills…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {jobTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              activeType === type
                ? "gradient-brand text-white shadow-sm"
                : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:border-brand-400"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Experience filter + sort */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-[var(--muted-foreground)]">Experience:</span>
        <div className="flex gap-1 flex-wrap">
          {experience.map((e) => (
            <button
              key={e}
              onClick={() => setActiveExp(e)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeExp === e
                  ? "bg-slate-900 text-white"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="ml-auto text-sm text-[var(--muted-foreground)]">
          <strong className="text-[var(--foreground)]">{filtered.length}</strong> jobs found
        </div>
      </div>

      {/* Job alerts banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-50 border border-brand-200">
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-800">Get instant job alerts</p>
          <p className="text-xs text-brand-600">Set up alerts for your dream role — we&apos;ll notify you via email, SMS & WhatsApp</p>
        </div>
        <Button variant="subtle" size="sm">Set Alert</Button>
      </div>

      {/* Jobs list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">💼</span>
          <h3 className="font-semibold text-[var(--foreground)] mb-2">No jobs found</h3>
          <p className="text-[var(--muted-foreground)] text-sm mb-4">Try adjusting filters or search terms</p>
          <Button variant="outline" onClick={() => { setSearch(""); setActiveType("All"); setActiveExp("All"); setShowGovt(false); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              index={i}
              alreadyApplied={appliedJobIds.has(job.id)}
              appliedActivityId={appliedActivityIdMap.get(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
