"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { sendEmail } from "@/lib/send-email";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    logo: string;
    location: string;
    mode: string;
    type: string;
    salary: string;
    exp: string;
    posted: string;
    tags: string[];
    urgent: boolean;
    govt: boolean;
  };
  index?: number;
  alreadyApplied?: boolean;
  appliedActivityId?: string;
}

const typeColors: Record<string, string> = {
  "Full-time":  "bg-blue-100 text-blue-700",
  "Internship": "bg-purple-100 text-purple-700",
  "Part-time":  "bg-yellow-100 text-yellow-700",
  "Remote":     "bg-emerald-100 text-emerald-700",
  "Government": "bg-orange-100 text-orange-700",
  "Freelance":  "bg-pink-100 text-pink-700",
};

const modeColors: Record<string, string> = {
  "Remote":  "text-emerald-600",
  "Hybrid":  "text-blue-600",
  "Offline": "text-slate-600",
};

export function JobCard({ job, index = 0, alreadyApplied = false, appliedActivityId }: JobCardProps) {
  const { data: session } = useSession();
  const [saved, setSaved]         = useState(false);
  const [applied, setApplied]     = useState(alreadyApplied);
  const [activityId, setActivityId] = useState(appliedActivityId);
  const [toast, setToast]         = useState<{ msg: string; color: string } | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const showToast = (msg: string, color: string) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApply = async () => {
    const userEmail = session?.user?.email;
    const userName  = session?.user?.name ?? "User";
    if (!userEmail || applied) return;
    setApplied(true);
    showToast(`Applied to ${job.company}! Good luck 🎉`, "bg-emerald-600");

    await sendEmail({
      type: "job-applied",
      to: userEmail,
      data: { name: userName.split(" ")[0], jobTitle: job.title, company: job.company, location: job.location },
    });
    fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, incrementStat: "applicationsSent" }),
    }).catch(() => {});

    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        type: "job-applied",
        itemId: job.id,
        itemTitle: job.title,
        itemDetails: `${job.company} · ${job.location} · ${job.type} · ${job.salary}`,
      }),
    }).catch(() => null);
    if (res?.ok) {
      const data = await res.json().catch(() => null);
      if (data?.activity?.id) setActivityId(data.activity.id);
    }
  };

  const handleWithdraw = async () => {
    const userEmail = session?.user?.email;
    if (!userEmail) return;
    setWithdrawing(true);
    setConfirmWithdraw(false);

    const id = activityId;
    if (id) {
      await fetch(`/api/activities?id=${encodeURIComponent(id)}&email=${encodeURIComponent(userEmail)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
    setApplied(false);
    setActivityId(undefined);
    setWithdrawing(false);
    showToast("Application withdrawn.", "bg-slate-700");
  };

  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className="group flex items-start gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card hover:shadow-card-hover transition-all animate-slide-up"
    >
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 ${toast.color} text-white px-5 py-3 rounded-2xl shadow-lg animate-slide-down`}>
          <span className="font-semibold text-sm">{toast.msg}</span>
        </div>
      )}

      {/* Withdraw confirm overlay */}
      {confirmWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4 animate-scale-in">
            <h3 className="font-bold text-[var(--foreground)] mb-2">Withdraw Application?</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">
              Are you sure you want to withdraw your application for <strong>{job.title}</strong> at {job.company}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmWithdraw(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Keep Application
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {withdrawing ? "Withdrawing…" : "Yes, Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company logo */}
      <div className="h-12 w-12 rounded-xl bg-[var(--muted)] flex items-center justify-center text-2xl shrink-0 border border-[var(--border)]">
        {job.logo}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              {job.urgent && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Urgent
                </span>
              )}
              {job.govt && (
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Govt
                </span>
              )}
            </div>
            {/* Clickable job title */}
            <Link
              href={`/jobs/${job.id}`}
              className="font-semibold text-[var(--foreground)] text-sm leading-tight hover:text-[var(--primary)] hover:underline underline-offset-2 transition-colors"
            >
              {job.title}
            </Link>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{job.company}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSaved(!saved)}
              title={saved ? "Unsave" : "Save job"}
              className={cn(
                "h-8 w-8 rounded-lg border flex items-center justify-center transition-all",
                saved
                  ? "bg-brand-100 border-brand-300 text-brand-600"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-brand-400 hover:text-brand-600"
              )}
            >
              <svg className="w-3.5 h-3.5" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            {!session?.user?.email ? (
              <Link
                href="/login"
                className="h-8 px-3 rounded-lg text-xs font-semibold gradient-brand text-white border border-transparent hover:opacity-90 inline-flex items-center"
              >
                Sign in to Apply
              </Link>
            ) : applied ? (
              <div className="flex items-center gap-1">
                <span className="h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300 inline-flex items-center gap-1">
                  ✓ Applied
                </span>
                <button
                  onClick={() => setConfirmWithdraw(true)}
                  title="Withdraw application"
                  className="h-8 w-8 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:border-red-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleApply}
                className="h-8 px-3 rounded-lg text-xs font-semibold gradient-brand text-white border-transparent hover:opacity-90 transition-all border"
              >
                Apply
              </button>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {job.location}
          </span>
          <span className={cn("font-medium", modeColors[job.mode] ?? "text-slate-600")}>{job.mode}</span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.salary}
          </span>
          <span>{job.exp}</span>
          <span className="ml-auto">{job.posted}</span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", typeColors[job.type] ?? "bg-slate-100 text-slate-600")}>
            {job.type}
          </span>
          {job.tags.map((tag) => (
            <span key={tag} className="text-[10px] bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* View full JD link */}
        <div className="mt-2.5">
          <Link
            href={`/jobs/${job.id}`}
            className="text-[11px] font-medium text-[var(--primary)] hover:underline underline-offset-2 inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            View full description →
          </Link>
        </div>
      </div>
    </div>
  );
}
