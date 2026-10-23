"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { sendEmail } from "@/lib/send-email";

interface Props {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
  openings?: string;
  deadline?: string;
}

export function JobApplyButton({ jobId, jobTitle, company, location, jobType, salary, openings, deadline }: Props) {
  const { data: session } = useSession();
  const [applied, setApplied] = useState(false);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const email = session?.user?.email;

  useEffect(() => {
    if (!email) { setChecking(false); return; }
    fetch(`/api/activities?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then(({ activities }) => {
        const match = (activities ?? []).find(
          (a: { type: string; itemId: string; id: string }) => a.type === "job-applied" && a.itemId === jobId
        );
        if (match) { setApplied(true); setActivityId(match.id); }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [email, jobId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleApply = async () => {
    if (!email || submitting) return;
    setSubmitting(true);
    const userName = session?.user?.name ?? "User";
    try {
      await sendEmail({ type: "job-applied", to: email, data: { name: userName.split(" ")[0], jobTitle, company, location } });
      fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, incrementStat: "applicationsSent" }) }).catch(() => {});
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "job-applied", itemId: jobId, itemTitle: jobTitle, itemDetails: `${company} · ${location} · ${jobType} · ${salary}` }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.activity?.id) setActivityId(data.activity.id);
      }
      setApplied(true);
      showToast(`Applied to ${company}! Good luck 🎉`);
    } catch { /* silent */ }
    setSubmitting(false);
  };

  const handleWithdraw = async () => {
    if (!email || !activityId) return;
    setWithdrawing(true);
    await fetch(`/api/activities?id=${encodeURIComponent(activityId)}&email=${encodeURIComponent(email)}`, { method: "DELETE" }).catch(() => {});
    setApplied(false);
    setActivityId(null);
    setWithdrawing(false);
    setConfirmWithdraw(false);
    showToast("Application withdrawn.");
  };

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl animate-slide-down text-sm font-semibold">
          {toast}
        </div>
      )}

      {confirmWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4 animate-scale-in">
            <h3 className="font-bold text-[var(--foreground)] mb-2">Withdraw Application?</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">
              Remove your application for <strong>{jobTitle}</strong> at {company}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmWithdraw(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Keep It
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

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-[var(--foreground)]">
            {applied ? "✓ You've applied for this role" : "Ready to apply?"}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {openings ? `${openings} position${Number(openings) > 1 ? "s" : ""} available` : "Positions available"}
            {deadline ? ` · Deadline ${new Date(deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {checking ? (
            <div className="h-11 w-28 bg-[var(--muted)] rounded-xl animate-pulse" />
          ) : !email ? (
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-glow hover:opacity-90 transition-all">
              Sign in to Apply
            </Link>
          ) : applied ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-sm">
                ✓ Applied
              </span>
              <button
                onClick={() => setConfirmWithdraw(true)}
                className="px-4 py-3 rounded-xl border border-[var(--border)] text-sm font-medium text-slate-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-all"
              >
                Withdraw
              </button>
            </>
          ) : (
            <button
              onClick={handleApply}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-glow hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-60"
            >
              {submitting ? "Applying…" : "Apply Now"}
              {!submitting && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
