import Link from "next/link";
import { getJobById } from "@/lib/job-store";
import { JobApplyButton } from "@/components/jobs/job-apply-button";

const typeColors: Record<string, string> = {
  "Full-time":  "bg-blue-100 text-blue-700",
  "Internship": "bg-purple-100 text-purple-700",
  "Part-time":  "bg-yellow-100 text-yellow-700",
  "Remote":     "bg-emerald-100 text-emerald-700",
  "Government": "bg-orange-100 text-orange-700",
  "Freelance":  "bg-pink-100 text-pink-700",
};

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id);

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in">
        <span className="text-5xl block mb-4">💼</span>
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Job details not available</h2>
        <p className="text-[var(--muted-foreground)] text-sm mb-6">
          This listing may have been removed or is an external posting.
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm"
        >
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  const salary =
    job.jobType === "Internship"
      ? job.stipend ? `₹${Number(job.stipend).toLocaleString("en-IN")}/month` : "Negotiable"
      : job.minSalary && job.maxSalary
      ? `${Math.round(Number(job.minSalary) / 100000)}–${Math.round(Number(job.maxSalary) / 100000)} LPA`
      : job.minSalary
      ? `${Math.round(Number(job.minSalary) / 100000)}+ LPA`
      : "Negotiable";

  const posted = (() => {
    const h = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / 3600000);
    return h < 1 ? "Just now" : h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
  })();

  const sections = [
    { label: "About the Role",   content: job.description,      icon: "📋" },
    { label: "Responsibilities", content: job.responsibilities, icon: "✅" },
    { label: "Requirements",     content: job.requirements,     icon: "📌" },
    { label: "Perks & Benefits", content: job.perks,            icon: "🎁" },
  ].filter((s) => s.content?.trim());

  const metaItems = [
    { icon: "📍", label: "Location",   value: job.location || "Remote" },
    { icon: "🏢", label: "Work Mode",  value: job.workMode },
    { icon: "💰", label: "Salary",     value: salary },
    ...(job.deadline ? [{ icon: "🗓️", label: "Deadline", value: new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) }] : []),
    { icon: "👥", label: "Openings",   value: job.openings ? `${job.openings} positions` : "Multiple" },
    ...(job.duration   ? [{ icon: "⏱️", label: "Duration",   value: job.duration }]   : []),
    ...(job.department ? [{ icon: "🏬", label: "Department", value: job.department }] : []),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-8">

      {/* Back */}
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to Jobs
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-2xl shrink-0 shadow-md">
            💼
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColors[job.jobType] ?? "bg-slate-100 text-slate-600"}`}>
                {job.jobType}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full">Active</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--foreground)] leading-tight mb-0.5">{job.title}</h1>
            <p className="text-[var(--muted-foreground)] text-sm">{job.company}</p>
            {job.organizerName && (
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Posted by {job.organizerName} · {posted}</p>
            )}
          </div>
        </div>

        {/* Key meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
          {metaItems.map((m) => (
            <div key={m.label} className="bg-[var(--muted)] rounded-xl p-3 border border-[var(--border)]">
              <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">
                {m.icon} {m.label}
              </p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Skills chips */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--muted-foreground)] font-medium mr-1 self-center">Skills:</span>
            {job.skills.map((s) => (
              <span key={s} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full font-medium">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content sections */}
      {sections.map((s) => (
        <div key={s.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-card">
          <h2 className="font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <span className="text-lg">{s.icon}</span> {s.label}
          </h2>
          <div className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap">
            {s.content}
          </div>
        </div>
      ))}

      {/* Apply / Withdraw — client component */}
      <JobApplyButton
        jobId={job.id}
        jobTitle={job.title}
        company={job.company}
        location={job.location || "Remote"}
        jobType={job.jobType}
        salary={salary}
        openings={job.openings}
        deadline={job.deadline}
      />
    </div>
  );
}
