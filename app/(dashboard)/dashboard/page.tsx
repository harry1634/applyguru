"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/user-context";
import type { StoredUser } from "@/lib/user-store";

// ── Participant quick actions ──────────────────────────────────────────────
const quickActions = [
  { label: "Find Events",     href: "/events",     icon: "🎉", color: "bg-blue-50   text-blue-700   hover:bg-blue-100" },
  { label: "Browse Jobs",     href: "/jobs",       icon: "💼", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { label: "Book Counseling", href: "/counseling", icon: "🎯", color: "bg-pink-50   text-pink-700   hover:bg-pink-100" },
  { label: "Join Workshop",   href: "/workshops",  icon: "🔧", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
];

const featuredEvents = [
  { id: "1", emoji: "💻", title: "AI/ML Hackathon — IIT Delhi", date: "Jan 25 · 9:00 AM", type: "Hackathon", mode: "Offline" },
  { id: "2", emoji: "📹", title: "Career Strategies Webinar 2025", date: "Feb 8 · 7:00 PM", type: "Webinar", mode: "Online" },
  { id: "3", emoji: "🔧", title: "Full-Stack AI Workshop", date: "Feb 3–7 · 10:00 AM", type: "Workshop", mode: "Online" },
];

// ── Organizer featured jobs ────────────────────────────────────────────────
const orgQuickActions = [
  { label: "Post an Event", href: "/organizers/create",           icon: "🎉", color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
  { label: "Post a Job",    href: "/organizers/jobs/create",      icon: "💼", color: "bg-blue-50   text-blue-700   hover:bg-blue-100" },
  { label: "My Dashboard",  href: "/organizers/dashboard",        icon: "📊", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { label: "Verification",  href: "/organizers/verify",           icon: "✅", color: "bg-amber-50  text-amber-700  hover:bg-amber-100" },
];

// ── Counselor quick actions ────────────────────────────────────────────────
const counselorQuickActions = [
  { label: "View Bookings",    href: "/counseling",    icon: "📅", color: "bg-blue-50   text-blue-700   hover:bg-blue-100" },
  { label: "My Sessions",      href: "/counseling",    icon: "🎯", color: "bg-pink-50   text-pink-700   hover:bg-pink-100" },
  { label: "Earnings",         href: "/counseling",    icon: "💰", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { label: "Update Profile",   href: "/profile",       icon: "👤", color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
];

function StatCard({ icon, gradient, value, label, change }: { icon: string; gradient: string; value: string | number; label: string; change: string }) {
  return (
    <Card className="overflow-hidden hover-lift">
      <CardContent className="p-5">
        <div className={`inline-flex h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} items-center justify-center text-xl mb-3`}>{icon}</div>
        <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{label}</p>
        <p className="text-xs text-emerald-600 font-medium mt-1">{change}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, title, desc, href, cta }: { icon: string; title: string; desc: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="font-semibold text-[var(--foreground)] mb-1">{title}</p>
      <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-xs">{desc}</p>
      <Button variant="gradient" size="sm" asChild><Link href={href}>{cta}</Link></Button>
    </div>
  );
}

const ACTIVITY_META: Record<string, { icon: string; color: string; label: string }> = {
  "event-registered":   { icon: "🎉", color: "bg-violet-100 text-violet-700", label: "Registered" },
  "job-applied":        { icon: "💼", color: "bg-blue-100 text-blue-700",     label: "Applied" },
  "workshop-enrolled":  { icon: "🔧", color: "bg-orange-100 text-orange-700", label: "Enrolled" },
  "webinar-registered": { icon: "📹", color: "bg-purple-100 text-purple-700", label: "Joined" },
  "volunteer-signed":   { icon: "🤝", color: "bg-emerald-100 text-emerald-700", label: "Volunteered" },
  "certificate-earned": { icon: "🏆", color: "bg-amber-100 text-amber-700",   label: "Earned" },
};

function ActivityFeed({ email }: { email: string }) {
  const [activities, setActivities] = useState<Array<{ id: string; type: string; itemTitle: string; timestamp: string; itemDetails?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) { setLoading(false); return; }
    fetch(`/api/activities?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then(({ activities }) => setActivities((activities ?? []).slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  const fmtTime = (iso: string) => {
    const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
    return h < 1 ? "Just now" : h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/profile" className="text-xs text-[var(--primary)] hover:underline font-medium">View all</Link>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-xl bg-[var(--muted)]" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-[var(--muted)] rounded w-3/4" />
                      <div className="h-2.5 bg-[var(--muted)] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-3xl mb-2">🚀</p>
                <p className="text-sm text-[var(--muted-foreground)]">No activity yet — start by exploring events or applying for jobs!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activities.map((a) => {
                  const meta = ACTIVITY_META[a.type] ?? { icon: "📌", color: "bg-slate-100 text-slate-600", label: "Activity" };
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--muted)] transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-lg shrink-0 border border-[var(--border)]">
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[var(--foreground)] truncate">{a.itemTitle}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.color}`}>{meta.label}</span>
                        </div>
                        {a.itemDetails && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">{a.itemDetails}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 mt-0.5">{fmtTime(a.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-1.5">
            {[
              { label: "Find Events",     href: "/events",     icon: "🎉", color: "hover:bg-violet-50 hover:border-violet-200" },
              { label: "Browse Jobs",     href: "/jobs",       icon: "💼", color: "hover:bg-blue-50 hover:border-blue-200" },
              { label: "Book Counseling", href: "/counseling", icon: "🎯", color: "hover:bg-pink-50 hover:border-pink-200" },
              { label: "Join Workshop",   href: "/workshops",  icon: "🔧", color: "hover:bg-orange-50 hover:border-orange-200" },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border)] transition-all text-sm font-medium text-slate-700 group ${a.color}`}>
                <span className="text-base group-hover:scale-110 transition-transform">{a.icon}</span>
                <span className="truncate">{a.label}</span>
                <svg className="w-3.5 h-3.5 ml-auto text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Next Steps</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {[
              { done: true,  label: "Created account",      xp: 50 },
              { done: (activities.some(a => a.type === "event-registered")), label: "Attended an event", xp: 50 },
              { done: (activities.some(a => a.type === "job-applied")),      label: "Applied for a job", xp: 30 },
              { done: (activities.some(a => a.type === "workshop-enrolled")), label: "Joined a workshop", xp: 50 },
              { done: (activities.some(a => a.type === "certificate-earned")), label: "Earned a certificate", xp: 100 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <span className={item.done ? "text-emerald-500 text-sm" : "text-slate-300 text-sm"}>
                  {item.done ? "✓" : "○"}
                </span>
                <span className={item.done ? "text-[var(--foreground)] font-medium flex-1" : "text-[var(--muted-foreground)] flex-1"}>{item.label}</span>
                <span className={`text-[10px] font-bold ${item.done ? "text-emerald-600" : "text-slate-300"}`}>+{item.xp} XP</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── PARTICIPANT DASHBOARD ─────────────────────────────────────────────────
function ParticipantDashboard({ user, firstName }: { user: StoredUser; firstName: string }) {
  const s = user.stats;
  const isNew = !s || (s.eventsAttended === 0 && s.applicationsSent === 0);
  const xp = (s?.eventsAttended ?? 0) * 50 + (s?.applicationsSent ?? 0) * 30 + (s?.certificatesEarned ?? 0) * 100;
  const level = xp < 500 ? "Bronze" : xp < 1500 ? "Silver" : xp < 3000 ? "Gold" : "Platinum";
  const levelColors: Record<string, string> = { Bronze: "from-amber-600 to-orange-500", Silver: "from-slate-400 to-slate-500", Gold: "from-yellow-400 to-amber-500", Platinum: "from-violet-500 to-purple-600" };
  const nextLevelXp = xp < 500 ? 500 : xp < 1500 ? 1500 : xp < 3000 ? 3000 : 5000;
  const xpPct = Math.min(Math.round((xp / nextLevelXp) * 100), 100);

  const stats = [
    { icon: "🎉", gradient: "from-violet-500 to-purple-600", value: s?.eventsAttended ?? 0,                              label: "Events Attended",  change: isNew ? "Join your first!" : "Keep going!" },
    { icon: "📤", gradient: "from-blue-500 to-cyan-600",     value: s?.applicationsSent ?? 0,                            label: "Applications Sent", change: isNew ? "Start applying!" : "Active" },
    { icon: "🏆", gradient: "from-emerald-500 to-teal-600",  value: s?.certificatesEarned ?? 0,                          label: "Certificates",     change: isNew ? "Earn your first!" : "Earned" },
    { icon: "🤝", gradient: "from-orange-500 to-amber-600",  value: s?.volunteerHours ? `${s.volunteerHours}h` : "0h",   label: "Volunteer Hours",  change: isNew ? "Give back!" : "Total" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => <StatCard key={st.label} {...st} />)}
      </div>

      {/* XP Progress Bar */}
      <div className={`rounded-2xl bg-gradient-to-r ${levelColors[level]} p-5 text-white`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">{level} Member</p>
            <p className="text-2xl font-black">{xp} XP</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs mb-0.5">Next level</p>
            <p className="font-bold text-lg">{nextLevelXp} XP</p>
          </div>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${xpPct}%` }} />
        </div>
        <p className="text-white/60 text-xs mt-2">{nextLevelXp - xp} XP to unlock {xp < 500 ? "Silver" : xp < 1500 ? "Gold" : xp < 3000 ? "Platinum" : "max level"}</p>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] mb-3 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--border)] font-medium text-sm transition-all hover-lift ${a.color}`}>
              <span className="text-xl">{a.icon}</span>{a.label}
            </Link>
          ))}
        </div>
      </div>

      {isNew ? (
        /* New user — featured opportunities */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Explore Events</CardTitle>
                <Link href="/events" className="text-xs text-[var(--primary)] hover:underline font-medium">View all</Link>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {featuredEvents.map((ev) => (
                  <Link key={ev.id} href={`/events/${ev.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--muted)] transition-colors group">
                    <div className="h-12 w-12 gradient-brand rounded-xl flex items-center justify-center text-2xl shrink-0">{ev.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">{ev.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{ev.date} · {ev.mode}</p>
                    </div>
                    <Badge variant="outline" size="sm">{ev.type}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="overflow-hidden">
              <div className="gradient-brand p-5">
                <p className="text-white font-bold text-lg">Welcome, {firstName}! 🎊</p>
                <p className="text-blue-200 text-xs mt-1">Your journey starts here. Complete your profile and start exploring!</p>
              </div>
              <CardContent className="py-4 space-y-2">
                {[
                  { done: true,  label: "Created your account" },
                  { done: !!user.college, label: "Added college info" },
                  { done: false, label: "Attend your first event" },
                  { done: false, label: "Apply for a job" },
                  { done: false, label: "Earn a certificate" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className={item.done ? "text-emerald-500" : "text-slate-300"}>
                      {item.done ? "✓" : "○"}
                    </span>
                    <span className={item.done ? "text-[var(--foreground)] font-medium" : "text-[var(--muted-foreground)]"}>{item.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Existing user — real activity */
        <ActivityFeed email={user.email} />
      )}
    </div>
  );
}

// ── ORGANIZER DASHBOARD ───────────────────────────────────────────────────
function OrganizerDashboard({ user, firstName }: { user: StoredUser; firstName: string }) {
  const s = user.stats;
  const isNew = !s || s.eventsCreated === 0;

  const stats = [
    { icon: "🎉", gradient: "from-violet-500 to-purple-600", value: s?.eventsCreated ?? 0,    label: "Events Created",       change: isNew ? "Create your first!" : "Active" },
    { icon: "💼", gradient: "from-blue-500 to-cyan-600",     value: s?.jobsPosted ?? 0,        label: "Jobs Posted",          change: isNew ? "Post a job now!"    : "Active" },
    { icon: "📥", gradient: "from-emerald-500 to-teal-600",  value: 0,                          label: "Applications Received", change: "Pending review" },
    { icon: "👥", gradient: "from-orange-500 to-amber-600",  value: 0,                          label: "Total Registrations",  change: "Across all events" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => <StatCard key={st.label} {...st} />)}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] mb-3 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {orgQuickActions.map((a) => (
            <Link key={a.href} href={a.href} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--border)] font-medium text-sm transition-all hover-lift ${a.color}`}>
              <span className="text-xl">{a.icon}</span>{a.label}
            </Link>
          ))}
        </div>
      </div>

      {isNew ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon="🚀"
              title="Create your first event"
              desc="Post hackathons, workshops, job fairs, and more to reach thousands of students on ApplyGuru."
              href="/organizers/create"
              cta="Post an Event →"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Your Events</CardTitle>
            <Link href="/organizers/dashboard" className="text-xs text-[var(--primary)] hover:underline font-medium">Full dashboard</Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col items-center py-8 text-center">
              <span className="text-3xl mb-3">🎉</span>
              <p className="text-sm text-[var(--muted-foreground)]">You&apos;ve created {s?.eventsCreated} events. <Link href="/organizers/dashboard" className="text-[var(--primary)] font-medium hover:underline">View them →</Link></p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Organisation: {(user as StoredUser & { orgName?: string }).orgName || user.name}</CardTitle></CardHeader>
        <CardContent className="pt-0 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {[
            ["Type", (user as StoredUser & { orgType?: string }).orgType || "—"],
            ["Email", user.email],
            ["Phone", user.phone || "—"],
            ["City", user.city || "—"],
            ["State", user.state || "—"],
            ["Website", (user as StoredUser & { orgWebsite?: string }).orgWebsite || "—"],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
              <p className="font-medium text-[var(--foreground)] truncate">{val}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── COUNSELOR DASHBOARD ───────────────────────────────────────────────────
function CounselorDashboard({ user, firstName }: { user: StoredUser; firstName: string }) {
  const s = user.stats;
  const isNew = !s || s.sessionsGiven === 0;

  const stats = [
    { icon: "🎯", gradient: "from-pink-500 to-rose-600",    value: s?.sessionsGiven ?? 0, label: "Sessions Given",    change: isNew ? "Take your first!" : "Total" },
    { icon: "📅", gradient: "from-blue-500 to-cyan-600",    value: 0,                      label: "Upcoming Bookings", change: "This week" },
    { icon: "⭐", gradient: "from-amber-500 to-yellow-600", value: "—",                    label: "Avg. Rating",       change: "From students" },
    { icon: "💰", gradient: "from-emerald-500 to-teal-600", value: "₹0",                  label: "Earnings",          change: "This month" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => <StatCard key={st.label} {...st} />)}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] mb-3 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {counselorQuickActions.map((a) => (
            <Link key={a.href} href={a.href} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--border)] font-medium text-sm transition-all hover-lift ${a.color}`}>
              <span className="text-xl">{a.icon}</span>{a.label}
            </Link>
          ))}
        </div>
      </div>

      {isNew ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon="🎯"
              title="Set up your counselor profile"
              desc="Complete your profile to start receiving session bookings from students looking for career guidance."
              href="/profile"
              cta="Complete Profile →"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Recent Sessions</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">You&apos;ve conducted {s?.sessionsGiven} sessions. <Link href="/counseling" className="text-[var(--primary)] font-medium hover:underline">View all →</Link></p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { profile } = useUser();
  const { data: session } = useSession();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  const email = session?.user?.email ?? profile.email;
  const firstName = profile.name.split(" ")[0] || "there";

  useEffect(() => {
    if (!email) { setLoading(false); return; }
    fetch(`/api/users?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then(({ user }) => { setUser(user ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [email]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Hello, {firstName}! 👋</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-0.5">
            {!user || !user.stats || user.stats.eventsAttended === 0
              ? "Welcome! Start exploring opportunities made for you."
              : `You've attended ${user.stats.eventsAttended} events and sent ${user.stats.applicationsSent} applications.`}
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href={user?.role === "organizer" ? "/organizers/create" : "/events"}>
            {user?.role === "organizer" ? "Post Event →" : "Discover Events →"}
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-5"><div className="h-24 animate-pulse bg-[var(--muted)] rounded-lg" /></CardContent></Card>
          ))}
        </div>
      ) : user?.role === "organizer" ? (
        <OrganizerDashboard user={user} firstName={firstName} />
      ) : user?.role === "counselor" ? (
        <CounselorDashboard user={user} firstName={firstName} />
      ) : (
        <ParticipantDashboard user={user ?? { id: "", name: profile.name, email: profile.email, image: null, provider: "google", role: "participant", onboardingComplete: false, firstLoginAt: "", lastLoginAt: "", loginCount: 0 }} firstName={firstName} />
      )}
    </div>
  );
}
