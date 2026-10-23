"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { sendEmail } from "@/lib/send-email";
import { trackActivity } from "@/lib/track-activity";
import type { StoredEvent } from "@/lib/event-store";

/* ── emoji / gradient helpers (same mapping as events listing) ── */
const TYPE_EMOJI: Record<string, string> = { Hackathon:"💻", Workshop:"🔧", Webinar:"📹", Summit:"🏢", Conference:"🎙️", Event:"📅" };
const CAT_EMOJI:  Record<string, string> = { Volunteer:"🤝", Career:"🎯", Education:"📚", Health:"🏥", Technology:"🚀", Business:"💼", Design:"🎨", Science:"🔬" };
const TYPE_GRAD:  Record<string, string> = { Hackathon:"from-blue-600 to-indigo-700", Workshop:"from-orange-500 to-red-500", Webinar:"from-purple-500 to-violet-600", Summit:"from-indigo-600 to-blue-700", Conference:"from-slate-600 to-slate-800" };
const CAT_GRAD:   Record<string, string> = { Volunteer:"from-emerald-500 to-teal-600", Career:"from-pink-500 to-rose-600", Education:"from-cyan-500 to-blue-500", Health:"from-rose-400 to-pink-500", Technology:"from-blue-500 to-indigo-600", Business:"from-indigo-500 to-blue-600" };

function getEmoji(type: string, cat: string) { return TYPE_EMOJI[type] ?? CAT_EMOJI[cat] ?? "📅"; }
function getGrad(type: string, cat: string)  { return TYPE_GRAD[type]  ?? CAT_GRAD[cat]  ?? "from-violet-500 to-purple-600"; }

function fmtDate(dateStr: string) {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr + "T00:00:00");
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Legacy hardcoded events (IDs 1–3, for mock data on listing page) ── */
type LegacyEvent = {
  id: string; emoji: string; title: string; category: string; organizer: string;
  date: string; time: string; location: string; mode: string; price: number;
  seats: number; registered: number; gradient: string; tags: string[];
  description: string; agenda: { time: string; activity: string }[];
};

const LEGACY: Record<string, LegacyEvent> = {
  "1": { id:"1", emoji:"🏆", title:"National Entrepreneurship Summit 2025", category:"Summit", organizer:"IIT Bombay", date:"Feb 15, 2025", time:"9:00 AM – 6:00 PM", location:"IIT Bombay, Powai, Mumbai", mode:"Offline", price:499, seats:2000, registered:1842, gradient:"from-amber-500 to-orange-600", tags:["Startup","Entrepreneurship","Networking"], description:"India's largest student entrepreneurship event with top founders, investors, and ecosystem leaders. Featuring keynotes, panel discussions, startup pitch competitions, and networking sessions.", agenda:[{time:"9:00 AM",activity:"Registration & Breakfast"},{time:"10:00 AM",activity:"Opening Keynote: Future of Indian Startups"},{time:"11:30 AM",activity:"Panel: Funding in 2025 — What Investors Look For"},{time:"1:00 PM",activity:"Networking Lunch"},{time:"2:30 PM",activity:"Workshop: Building MVP in 30 Days"},{time:"4:00 PM",activity:"Startup Pitch Competition"},{time:"5:30 PM",activity:"Awards & Closing"}] },
  "2": { id:"2", emoji:"💻", title:"HackIndia 2025 — 48-Hour Hackathon",  category:"Hackathon", organizer:"Google Developer Groups", date:"Feb 22-23, 2025", time:"10:00 AM (48 hrs)", location:"Online + Offline Hubs", mode:"Hybrid", price:0, seats:5000, registered:3241, gradient:"from-blue-600 to-violet-600", tags:["Hackathon","AI","Open Source"], description:"Join 5000+ developers, designers, and innovators for a 48-hour sprint to build solutions for real-world challenges. Prizes worth ₹10 Lakhs!", agenda:[{time:"Day 1 10:00 AM",activity:"Opening ceremony & problem statements"},{time:"Day 1 12:00 PM",activity:"Hacking begins"},{time:"Day 2 10:00 AM",activity:"Final submission"},{time:"Day 2 2:00 PM",activity:"Judging & presentations"},{time:"Day 2 5:00 PM",activity:"Winners announced"}] },
  "3": { id:"3", emoji:"🌿", title:"Green Campus Initiative – Tree Plantation", category:"Volunteer", organizer:"NSS VIT Vellore", date:"Feb 8, 2025", time:"7:00 AM – 11:00 AM", location:"VIT Vellore Campus", mode:"Offline", price:0, seats:300, registered:189, gradient:"from-emerald-500 to-green-600", tags:["Environment","NSS","Volunteer"], description:"Be a part of the Green Campus Initiative and help plant 500 trees across the VIT Vellore campus. Earn volunteer hours and a participation certificate!", agenda:[{time:"7:00 AM",activity:"Assembly & briefing"},{time:"7:30 AM",activity:"Sapling distribution"},{time:"8:00 AM",activity:"Plantation drive"},{time:"10:30 AM",activity:"Group photo & refreshments"},{time:"11:00 AM",activity:"Certificate distribution"}] },
};

/* ── Detail page ── */
export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();

  const [liveEvent,   setLiveEvent]   = useState<StoredEvent | null>(null);
  const [legacyEvent, setLegacyEvent] = useState<LegacyEvent | null>(null);
  const [regCount,    setRegCount]    = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);

  const [registered,    setRegistered]    = useState(false);
  const [activityId,    setActivityId]    = useState<string | null>(null);
  const [registering,   setRegistering]   = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling,    setCancelling]    = useState(false);
  const [refundModal,   setRefundModal]   = useState(false);

  useEffect(() => {
    const id = params.id;
    // Legacy mock event
    if (LEGACY[id]) {
      setLegacyEvent(LEGACY[id]);
      setLoading(false);
      return;
    }
    // Real event from store
    Promise.all([
      fetch(`/api/events?id=${id}`).then((r) => r.json()),
      fetch(`/api/activities?itemId=${id}`).then((r) => r.json()),
    ]).then(([evData, actData]) => {
      if (!evData.event) { setNotFound(true); }
      else {
        setLiveEvent(evData.event);
        const regTypes = ["event-registered","workshop-enrolled","webinar-registered"];
        const allRegs: { id: string; type: string; email: string }[] = (actData.activities ?? []).filter(
          (a: { type: string }) => regTypes.includes(a.type)
        );
        setRegCount(allRegs.length);
        // Mark as already registered if this user's email is in the list
        const myEmail = session?.user?.email;
        const myReg = myEmail ? allRegs.find((a) => a.email === myEmail) : undefined;
        if (myReg) {
          setRegistered(true);
          setActivityId(myReg.id);
        }
      }
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id, session?.user?.email]);

  const handleRegister = async () => {
    const userEmail = session?.user?.email;
    const userName  = session?.user?.name ?? "Participant";
    if (!userEmail || registered) return;
    setRegistering(true);

    const title    = liveEvent?.title    ?? legacyEvent?.title    ?? "";
    const dateStr  = liveEvent ? `${fmtDate(liveEvent.date)}${liveEvent.time ? ` · ${liveEvent.time}` : ""}` : `${legacyEvent?.date} · ${legacyEvent?.time}`;
    const mode     = liveEvent?.mode     ?? legacyEvent?.mode     ?? "Online";
    const location = liveEvent?.location ?? legacyEvent?.location ?? "";

    await sendEmail({ type:"event-registered", to: userEmail, data:{ name: userName.split(" ")[0], eventName: title, eventDate: dateStr, eventMode: mode, eventLocation: mode !== "Online" ? location : undefined } });
    fetch("/api/users", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: userEmail, incrementStat:"eventsAttended" }) }).catch(() => {});
    const actResult = await trackActivity({ email: userEmail, type:"event-registered", itemId: params.id, itemTitle: title, itemDetails: `${dateStr} · ${mode}` });
    if (actResult?.id) setActivityId(actResult.id);
    setRegCount((c) => c + 1);
    setRegistering(false);
    setRegistered(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelRegistration = async () => {
    const email = session?.user?.email;
    if (!email) return;
    setCancelling(true);
    try {
      // Use stored ID if available, otherwise look it up fresh from the server
      let id = activityId;
      if (!id) {
        const data = await fetch(`/api/activities?itemId=${params.id}`).then((r) => r.json());
        const regTypes = ["event-registered", "workshop-enrolled", "webinar-registered"];
        const match = (data.activities ?? []).find(
          (a: { id: string; email: string; type: string }) => a.email === email && regTypes.includes(a.type)
        );
        id = match?.id ?? null;
      }
      if (!id) { setCancelling(false); return; }
      await fetch(`/api/activities?id=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`, { method: "DELETE" });
      setRegistered(false);
      setActivityId(null);
      setRegCount((c) => Math.max(0, c - 1));
      setCancelConfirm(false);
      const isPaid = (liveEvent ? (parseInt(liveEvent.fee) || 0) : (legacyEvent?.price ?? 0)) > 0;
      if (isPaid && liveEvent?.organizerEmail) setRefundModal(true);
    } catch {
      /* ignore */
    } finally {
      setCancelling(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
      <div className="h-52 bg-slate-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-48 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  /* ── Not found ── */
  if (notFound || (!liveEvent && !legacyEvent)) return (
    <div className="max-w-4xl text-center py-24">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Event not found</h1>
      <p className="text-slate-500 text-sm mb-6">This event may have been removed or the link is incorrect.</p>
      <Button variant="gradient" asChild><Link href="/events">← Browse Events</Link></Button>
    </div>
  );

  /* ── Derived display values ── */
  let emoji: string, gradient: string, title: string, category: string, organizer: string,
      dateLabel: string, timeLabel: string, locationLabel: string, mode: string,
      price: number, seats: number, description: string, tags: string[],
      meetLink: string | undefined,
      deadline: string | undefined,
      agenda: { time: string; activity: string }[];

  if (liveEvent) {
    emoji         = getEmoji(liveEvent.type, liveEvent.category);
    gradient      = getGrad(liveEvent.type, liveEvent.category);
    title         = liveEvent.title;
    category      = liveEvent.type;
    organizer     = liveEvent.organizerName || "Unknown";
    dateLabel     = fmtDate(liveEvent.date);
    timeLabel     = [liveEvent.time, liveEvent.endTime].filter(Boolean).join(" – ") || "TBD";
    locationLabel = (liveEvent.mode === "Online" ? "Online" : liveEvent.location) || "TBD";
    mode          = liveEvent.mode;
    price         = parseInt(liveEvent.fee) || 0;
    seats         = parseInt(liveEvent.capacity) || 0;
    description   = liveEvent.description || "No description provided.";
    tags          = liveEvent.tags ? liveEvent.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    meetLink      = liveEvent.meetLink || undefined;
    deadline      = liveEvent.registrationDeadline ? fmtDate(liveEvent.registrationDeadline) : undefined;
    agenda        = [];
  } else {
    const e       = legacyEvent!;
    emoji         = e.emoji; gradient = e.gradient; title = e.title; category = e.category;
    organizer     = e.organizer; dateLabel = e.date; timeLabel = e.time;
    locationLabel = e.location; mode = e.mode; price = e.price; seats = e.seats;
    description   = e.description; tags = e.tags; meetLink = undefined; deadline = undefined;
    agenda        = e.agenda;
    if (!regCount) setRegCount(e.registered); // seed with mock count once
  }

  const fillPct = seats > 0 ? Math.min(100, (regCount / seats) * 100) : 0;
  const userEmail = session?.user?.email;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {registered && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg">
          <span className="text-lg">🎉</span>
          <div>
            <p className="font-semibold text-sm">You&apos;re registered!</p>
            <p className="text-xs text-emerald-100">Confirmation sent to {userEmail}</p>
          </div>
        </div>
      )}

      {/* Cancel confirmation dialog */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <p className="text-lg font-bold text-slate-900 mb-1">Cancel registration?</p>
            <p className="text-sm text-slate-500 mb-1"><span className="font-semibold text-slate-700">{title}</span></p>
            {price > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                ⚠️ This was a paid event. You will be guided to contact the organizer for a refund after cancellation.
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setCancelConfirm(false)}>Keep it</Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
                loading={cancelling}
                onClick={handleCancelRegistration}
              >
                Yes, cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund modal (paid event) */}
      {refundModal && liveEvent?.organizerEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">💸</div>
            <p className="text-lg font-bold text-slate-900 mb-1">Registration Cancelled</p>
            <p className="text-sm text-slate-500 mb-4">
              Since <span className="font-semibold text-slate-700">{title}</span> was a paid event, contact the organizer to request a refund.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-slate-400 mb-0.5">Organizer email</p>
              <p className="text-sm font-semibold text-slate-800 break-all">{liveEvent.organizerEmail}</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(liveEvent.organizerEmail)}&su=${encodeURIComponent(`Refund Request — ${title}`)}&body=${encodeURIComponent(`Hi,\n\nI recently cancelled my registration for "${title}" and would like to request a refund.\n\nPlease let me know the next steps.\n\nThank you.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold text-center hover:opacity-90 transition-opacity"
              >
                ✉️ Email organizer for refund
              </a>
              <Button variant="outline" className="w-full" onClick={() => setRefundModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <Link href="/events" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
        ← Back to Events
      </Link>

      {/* Hero */}
      <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-8 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <span className="text-5xl">{emoji}</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-xl ${price === 0 ? "bg-emerald-500" : "bg-white/20"}`}>
              {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
            </span>
          </div>
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-2">{category}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
            <span>📅 {dateLabel}</span>
            <span>🕐 {timeLabel}</span>
            <span>📍 {locationLabel}</span>
            <span>🏢 {organizer}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — details */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold text-[var(--foreground)] mb-3">About this Event</h2>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">{description}</p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((t) => (
                    <span key={t} className="text-xs bg-[var(--muted)] text-[var(--foreground)] px-3 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event details grid */}
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold text-[var(--foreground)] mb-4">Event Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon:"📅", label:"Date",     value: dateLabel },
                  { icon:"🕐", label:"Time",     value: timeLabel },
                  { icon:"📍", label:"Location", value: locationLabel },
                  { icon:"🎭", label:"Mode",     value: mode },
                  ...(seats > 0 ? [{ icon:"👥", label:"Capacity", value:`${seats.toLocaleString()} seats` }] : []),
                  ...(deadline   ? [{ icon:"⏰", label:"Registration closes", value: deadline }] : []),
                  ...(meetLink && mode !== "Offline" ? [{ icon:"🔗", label:"Meeting Link", value: meetLink }] : []),
                ].map((d) => (
                  <div key={d.label} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]">
                    <span className="text-lg shrink-0">{d.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--muted-foreground)] font-medium">{d.label}</p>
                      <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5 break-all">{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agenda (legacy events only) */}
          {agenda.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-bold text-[var(--foreground)] mb-4">Schedule</h2>
                <div className="space-y-3">
                  {agenda.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-28 shrink-0 text-xs font-semibold text-[var(--primary)] pt-0.5">{item.time}</div>
                      <div className="flex-1 text-sm text-[var(--foreground)] border-l border-[var(--border)] pl-4 pb-3 last:pb-0">{item.activity}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — registration card */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              {seats > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[var(--muted-foreground)]">{regCount.toLocaleString()} registered</span>
                    <span className="font-semibold text-[var(--foreground)]">{(seats - regCount).toLocaleString()} left</span>
                  </div>
                  <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full gradient-brand rounded-full transition-all" style={{ width:`${fillPct}%` }} />
                  </div>
                </div>
              )}

              {!userEmail ? (
                <Button variant="gradient" className="w-full" size="lg" asChild>
                  <Link href="/login">Sign in to Register</Link>
                </Button>
              ) : registered ? (
                <div className="space-y-2">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-emerald-700 font-semibold text-sm">✅ You&apos;re registered!</p>
                    <p className="text-emerald-600 text-xs mt-1">Confirmation sent to {userEmail}</p>
                  </div>
                  <button
                    onClick={() => setCancelConfirm(true)}
                    className="w-full text-xs text-red-500 hover:text-red-700 font-semibold py-1.5 transition-colors"
                  >
                    Cancel registration
                  </button>
                </div>
              ) : (
                <Button variant="gradient" className="w-full" size="lg" loading={registering} onClick={handleRegister}>
                  {price === 0 ? "Register Free →" : `Register — ₹${price.toLocaleString("en-IN")} →`}
                </Button>
              )}

              <Button variant="outline" className="w-full" size="sm" onClick={() => setSaved((s) => !s)}>
                {saved ? "🔖 Saved!" : "🔖 Save for later"}
              </Button>
              <Button variant="ghost" className="w-full" size="sm" onClick={handleShare}>
                {copied ? "✓ Link copied!" : "📤 Share event"}
              </Button>

              <div className="text-xs text-[var(--muted-foreground)] text-center">
                Mode: <span className="font-semibold text-[var(--foreground)]">{mode}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Organizer</p>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shrink-0`}>{emoji}</div>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{organizer}</p>
                  <Badge variant="success" size="sm">Verified organizer</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
