"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StoredEvent } from "@/lib/event-store";

interface Activity {
  id: string; email: string; type: string;
  itemId: string; itemTitle: string; itemDetails?: string; timestamp: string;
}
interface StoredUser {
  name: string; email: string; image: string | null;
  phone?: string; college?: string; orgName?: string; role: string;
}
interface Confirmation {
  id: string; activityId: string; eventId: string;
  participantEmail: string; status: "confirmed" | "rejected"; confirmedAt: string;
}

function fmt(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTs(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const MODE_BADGE: Record<string, string> = {
  Online:  "bg-blue-100 text-blue-700",
  Offline: "bg-orange-100 text-orange-700",
  Hybrid:  "bg-violet-100 text-violet-700",
};

const CONF_BADGE: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  rejected:  "bg-red-100 text-red-600 border border-red-200",
};

export default function AdminEventDetailPage({ params }: { params: { id: string } }) {
  const [event,        setEvent]        = useState<StoredEvent | null>(null);
  const [participants, setParticipants] = useState<(Activity & { user?: StoredUser })[]>([]);
  const [confirmMap,   setConfirmMap]   = useState<Record<string, Confirmation>>({});
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast,        setToast]        = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    const id = params.id;
    try {
      const [evData, actData, usersData, confData] = await Promise.all([
        fetch(`/api/events?id=${id}`).then((r) => r.json()),
        fetch(`/api/activities?itemId=${id}`).then((r) => r.json()),
        fetch("/api/users").then((r) => r.json()),
        fetch(`/api/confirmations?eventId=${id}`).then((r) => r.json()),
      ]);

      if (!evData.event) { setNotFound(true); return; }
      setEvent(evData.event);

      const regTypes = ["event-registered", "workshop-enrolled", "webinar-registered"];
      const regs: Activity[] = (actData.activities ?? []).filter((a: Activity) => regTypes.includes(a.type));

      const usersMap: Record<string, StoredUser> = {};
      for (const u of (usersData.users ?? [])) usersMap[u.email] = u;

      setParticipants(regs.map((r) => ({ ...r, user: usersMap[r.email] })));

      const cMap: Record<string, Confirmation> = {};
      for (const c of (confData.confirmations ?? [])) cMap[c.activityId] = c;
      setConfirmMap(cMap);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirmation = async (activity: Activity & { user?: StoredUser }, status: "confirmed" | "rejected") => {
    setActionLoading(activity.id);
    try {
      const res = await fetch("/api/confirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: activity.id, eventId: params.id, participantEmail: activity.email, status }),
      });
      if (!res.ok) throw new Error("Failed");
      const { confirmation } = await res.json();
      setConfirmMap((prev) => ({ ...prev, [activity.id]: confirmation }));
      showToast(status === "confirmed"
        ? `✅ ${activity.user?.name ?? activity.email} confirmed — visible in organizer dashboard`
        : `❌ ${activity.user?.name ?? activity.email} rejected`
      );
    } catch {
      showToast("Action failed. Please try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveConfirmation = async (activityId: string) => {
    setActionLoading(activityId);
    try {
      await fetch("/api/confirmations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId }),
      });
      setConfirmMap((prev) => { const next = { ...prev }; delete next[activityId]; return next; });
      showToast("Confirmation removed");
    } catch {
      showToast("Failed to remove confirmation", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmAll = async () => {
    const pendingList = participants.filter((p) => !confirmMap[p.id]);
    if (pendingList.length === 0) { showToast("No pending participants to confirm."); return; }
    setActionLoading("__all__");
    try {
      const results = await Promise.all(
        pendingList.map((p) =>
          fetch("/api/confirmations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activityId: p.id, eventId: params.id, participantEmail: p.email, status: "confirmed" }),
          }).then((r) => r.json())
        )
      );
      setConfirmMap((prev) => {
        const next = { ...prev };
        results.forEach(({ confirmation }) => { if (confirmation) next[confirmation.activityId] = confirmation; });
        return next;
      });
      showToast(`✅ ${pendingList.length} participants confirmed — now visible in organizer dashboard`);
    } catch {
      showToast("Some confirmations failed. Please try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };

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

  if (notFound || !event) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <p className="text-5xl">🔍</p>
      <h1 className="text-xl font-bold text-slate-800">Event not found</h1>
      <Link href="/admin/events"><Button variant="outline">← Back to Events</Button></Link>
    </div>
  );

  const fee      = parseInt(event.fee) || 0;
  const capacity = parseInt(event.capacity) || 0;
  const regs     = participants.length;
  const confirmed = Object.values(confirmMap).filter((c) => c.status === "confirmed").length;
  const rejected  = Object.values(confirmMap).filter((c) => c.status === "rejected").length;
  const pending   = regs - confirmed - rejected;
  const fillPct  = capacity > 0 ? Math.min(100, Math.round((regs / capacity) * 100)) : 0;
  const revenue  = fee * confirmed;

  const infoCells = [
    { label: "Organizer",     value: event.organizerName },
    { label: "Org. Email",    value: event.organizerEmail },
    { label: "Type",          value: event.type },
    { label: "Category",      value: event.category },
    { label: "Date",          value: fmt(event.date) },
    { label: "Time",          value: [event.time, event.endTime].filter(Boolean).join(" – ") || "—" },
    { label: "Location",      value: event.mode === "Online" ? "Online" : (event.location || "—") },
    { label: "Reg. Deadline", value: event.registrationDeadline ? fmt(event.registrationDeadline) : "—" },
    { label: "Status",        value: event.status },
    { label: "Created",       value: fmtTs(event.createdAt) },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg text-white transition-all ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          {toast.msg}
        </div>
      )}

      <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard"><div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center shrink-0"><span className="text-white font-bold text-sm">AG</span></div></Link>
          <span className="text-slate-300">/</span>
          <Link href="/admin/users" className="text-sm text-slate-500 hover:text-slate-800 hidden sm:block">Admin</Link>
          <span className="text-slate-300 hidden sm:block">/</span>
          <Link href="/admin/events" className="text-sm text-slate-500 hover:text-slate-800">Events</Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800 truncate text-sm">{event.title}</span>
        </div>
        <Link href="/admin/events"><Button variant="outline" size="sm">← Events</Button></Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Registered", value: regs,      color: "text-slate-900",   sub: capacity > 0 ? `of ${capacity} seats` : "no seat limit" },
            { label: "Confirmed",        value: confirmed,  color: "text-emerald-600", sub: "admin approved · visible to org" },
            { label: "Pending Review",   value: pending,    color: "text-amber-600",   sub: "awaiting admin confirmation" },
            { label: "Confirmed Revenue",value: fee > 0 ? `₹${revenue.toLocaleString("en-IN")}` : "—", color: "text-violet-600", sub: fee > 0 ? `₹${fee} × ${confirmed} confirmed` : "free event" },
          ].map((s) => (
            <Card key={s.label}><CardContent className="p-5">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.sub}</p>
            </CardContent></Card>
          ))}
        </div>

        {/* Info notice */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-lg shrink-0">ℹ️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Admin approval required:</strong> Only <strong>Confirmed</strong> participants are visible in the organizer&apos;s dashboard.
            Pending participants are registered but the organizer cannot see their details until you confirm them.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Event info */}
          <Card className="lg:col-span-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📅</span>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm leading-tight">{event.title}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${MODE_BADGE[event.mode]}`}>{event.mode}</span>
                </div>
              </div>
              {capacity > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">{regs} registered</span>
                    <span className="font-semibold text-slate-700">{fillPct}% full</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full gradient-brand rounded-full" style={{ width: `${fillPct}%` }} />
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
              {/* Fee */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Registration Fee</span>
                  <span className="text-sm font-bold text-slate-800">
                    {fee === 0 ? <span className="text-emerald-600">Free</span> : `₹${fee.toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="font-bold text-slate-900">Registered Participants ({regs})</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {confirmed} confirmed · {pending} pending · {rejected} rejected
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {pending > 0 && (
                    <button
                      onClick={handleConfirmAll}
                      disabled={actionLoading === "__all__"}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {actionLoading === "__all__" ? "Confirming all…" : `✓ Confirm All Pending (${pending})`}
                    </button>
                  )}
                  {regs > 0 && (
                    <button
                      onClick={() => {
                        const csv = ["Name,Email,Phone,College,Status,Amount,Registered At",
                          ...participants.map((p) => {
                            const conf = confirmMap[p.id];
                            return `"${p.user?.name ?? "Unknown"}","${p.email}","${p.user?.phone ?? ""}","${p.user?.college ?? p.user?.orgName ?? ""}","${conf?.status ?? "pending"}","${fee === 0 ? "Free" : `₹${fee}`}","${fmtTs(p.timestamp)}"`;
                          })
                        ].join("\n");
                        const blob = new Blob([csv], { type: "text/csv" });
                        const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                        a.download = `${event!.title}-participants.csv`; a.click();
                      }}
                      className="text-xs text-violet-600 hover:text-violet-800 font-semibold"
                    >
                      ↓ Export CSV
                    </button>
                  )}
                </div>
              </div>

              {regs === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-3xl mb-2">👥</p>
                  <p className="text-sm font-semibold text-slate-700">No registrations yet</p>
                  <p className="text-xs text-slate-400 mt-1">Participants will appear here once they register</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {participants.map((p, i) => {
                    const conf    = confirmMap[p.id];
                    const isLoading = actionLoading === p.id || actionLoading === "__all__";

                    return (
                      <div key={p.id} className="px-5 py-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                        {/* Rank */}
                        <span className="text-xs text-slate-400 font-medium w-5 shrink-0 pt-1">{i + 1}</span>

                        {/* Avatar */}
                        {p.user?.image
                          ? <img src={p.user.image} alt={p.user.name} className="h-9 w-9 rounded-full object-cover shrink-0" /> // eslint-disable-line @next/next/no-img-element
                          : <div className="h-9 w-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {(p.user?.name ?? p.email).slice(0, 2).toUpperCase()}
                            </div>
                        }

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-800">{p.user?.name ?? "—"}</p>
                            {conf && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CONF_BADGE[conf.status]}`}>
                                {conf.status === "confirmed" ? "✓ Confirmed" : "✕ Rejected"}
                              </span>
                            )}
                            {!conf && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                ⏳ Pending
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{p.email}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-slate-400">
                            {p.user?.phone    && <span>📞 {p.user.phone}</span>}
                            {(p.user?.college ?? p.user?.orgName) && <span>🏫 {p.user?.college ?? p.user?.orgName}</span>}
                            <span>📅 {fmtTs(p.timestamp)}</span>
                            <span>💰 {fee === 0 ? "Free" : `₹${fee.toLocaleString("en-IN")}`}</span>
                          </div>
                          {conf && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {conf.status === "confirmed" ? "✓ Confirmed" : "✕ Rejected"} at {fmtTs(conf.confirmedAt)}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-1.5 shrink-0">
                          {!conf || conf.status === "rejected" ? (
                            <button
                              onClick={() => handleConfirmation(p, "confirmed")}
                              disabled={isLoading}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                            >
                              {isLoading ? "…" : "✓ Confirm"}
                            </button>
                          ) : null}
                          {!conf || conf.status === "confirmed" ? (
                            <button
                              onClick={() => conf ? handleRemoveConfirmation(p.id) : handleConfirmation(p, "rejected")}
                              disabled={isLoading}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                            >
                              {isLoading ? "…" : conf?.status === "confirmed" ? "✕ Remove" : "✕ Reject"}
                            </button>
                          ) : null}
                          {conf?.status === "rejected" && (
                            <button
                              onClick={() => handleRemoveConfirmation(p.id)}
                              disabled={isLoading}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                              {isLoading ? "…" : "Reset"}
                            </button>
                          )}
                          <Link href={`/admin/users/${encodeURIComponent(p.email)}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-center transition-colors">
                            Profile
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
