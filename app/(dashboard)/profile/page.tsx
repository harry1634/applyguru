"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import type { Activity } from "@/lib/activity-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/user-context";

const badgesList = [
  { icon: "🏆", label: "Gold Member",     desc: "1000+ XP earned",           gradient: "from-amber-400 to-yellow-500" },
  { icon: "🤝", label: "Volunteer Hero",  desc: "50+ volunteer hours",       gradient: "from-emerald-400 to-teal-500" },
  { icon: "💻", label: "Hacker",          desc: "Participated in hackathon", gradient: "from-blue-400 to-indigo-500" },
  { icon: "🎓", label: "Certificate Pro", desc: "8 certificates earned",     gradient: "from-purple-400 to-violet-500" },
  { icon: "📣", label: "Referral Star",   desc: "Referred 5+ friends",       gradient: "from-pink-400 to-rose-500" },
  { icon: "⚡", label: "Early Adopter",   desc: "Joined in beta phase",      gradient: "from-cyan-400 to-blue-500" },
];

const certificates = [
  { title: "Full-Stack Web Development",   issuer: "TechMentor India", date: "Dec 2024", id: "cert-001" },
  { title: "Data Science Fundamentals",    issuer: "DataFirst",        date: "Nov 2024", id: "cert-002" },
  { title: "Volunteer of the Year – NSS",  issuer: "NSS VIT",          date: "Oct 2024", id: "cert-003" },
  { title: "Hackathon Participant – SPIT", issuer: "SPIT Mumbai",      date: "Sep 2024", id: "cert-004" },
];

const TYPE_ICONS: Record<string, string> = { "event-registered": "🎉", "workshop-enrolled": "🔧", "webinar-registered": "📹", "job-applied": "💼", "event-created": "🚀", "job-posted": "📋" };
const TYPE_LABELS: Record<string, string> = { "event-registered": "Registered for", "workshop-enrolled": "Enrolled in", "webinar-registered": "Registered for", "job-applied": "Applied to", "event-created": "Created event", "job-posted": "Posted job" };

export default function ProfilePage() {
  const { profile, updateProfile, syncFromAPI } = useUser();
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const email = session?.user?.email ?? profile.email;

  // Sync real data from API on mount
  useEffect(() => {
    if (!email) return;
    syncFromAPI(email);
    fetch(`/api/activities?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then(({ activities }) => setActivities(activities ?? []))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const eventsAttended = activities.filter((a) => ["event-registered","workshop-enrolled","webinar-registered"].includes(a.type));
  const jobsApplied    = activities.filter((a) => a.type === "job-applied");
  const eventsCreated  = activities.filter((a) => a.type === "event-created");

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [draft, setDraft] = useState({ ...profile });

  const startEdit = () => { setDraft({ ...profile }); setEditing(true); setSaved(false); };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Photo must be under 2MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setDraft((d) => ({ ...d, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile(draft); // includes draft.avatar
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => { setEditing(false); setDraft({ ...profile }); };

  const removeSkill    = (s: string) => setDraft((d) => ({ ...d, skills: d.skills.filter((x) => x !== s) }));
  const removeInterest = (i: string) => setDraft((d) => ({ ...d, interests: d.interests.filter((x) => x !== i) }));

  const addSkill = () => {
    const v = newSkill.trim();
    if (v && !draft.skills.includes(v)) setDraft((d) => ({ ...d, skills: [...d.skills, v] }));
    setNewSkill("");
  };
  const addInterest = () => {
    const v = newInterest.trim();
    if (v && !draft.interests.includes(v)) setDraft((d) => ({ ...d, interests: [...d.interests, v] }));
    setNewInterest("");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: profile.email }),
    }).catch(() => {});
    localStorage.clear();
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  const p = editing ? draft : profile;

  return (
    <div className="space-y-6 animate-fade-in">
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg animate-slide-down">
          <span className="text-lg">✅</span>
          <span className="font-semibold text-sm">Profile saved successfully!</span>
        </div>
      )}

      {/* Profile header */}
      <Card className="overflow-hidden">
        <div className="h-32 gradient-brand relative">
          <div className="absolute inset-0 mesh-hero opacity-40" />
          {!editing && (
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}
                className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                {copied ? "✓ Copied!" : "Share Profile"}
              </Button>
              <Button variant="outline" size="sm" onClick={startEdit}
                className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                Edit Profile
              </Button>
            </div>
          )}
        </div>

        <CardContent className="pt-0 pb-6 px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
            {/* Avatar — clickable to upload when editing */}
            <div className="-mt-10 shrink-0 relative z-10">
              <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleAvatarUpload} />
              <div className="relative group" onClick={() => editing && photoInputRef.current?.click()} style={{ cursor: editing ? "pointer" : "default" }}>
                <Avatar src={p.avatar} name={p.name} size="xl" className="ring-4 ring-white shadow-lg" />
                {editing && (
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input label="Full name" value={draft.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                    <Input label="Username" value={draft.username}
                      onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value }))} />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-[var(--foreground)]">{p.name}</h1>
                    <Badge variant="subtle" size="sm">🏆 Gold Member</Badge>
                    <Badge variant="success" size="sm">Verified</Badge>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    CS Student · {p.college} · Batch of {p.batch}
                  </p>
                </div>
              )}
            </div>

            {editing ? (
              <div className="flex gap-2 sm:self-end">
                <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
                <Button variant="gradient" size="sm" onClick={handleSave}>Save changes ✓</Button>
              </div>
            ) : (
              <div className="flex gap-2 sm:self-end">
                <Button variant="gradient" size="sm" asChild>
                  <Link href="/settings">Settings</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Bio */}
          {editing ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Bio</label>
              <textarea rows={3} value={draft.bio}
                onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all" />
            </div>
          ) : (
            <p className="text-sm text-[var(--foreground)] mb-4 max-w-2xl">{p.bio}</p>
          )}

          {/* XP bar */}
          <div className="bg-[var(--muted)] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[var(--foreground)]">🏆 Gold Member — 1,240 XP</span>
              <span className="text-xs text-[var(--muted-foreground)]">280 XP to Platinum</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full gradient-brand rounded-full" style={{ width: "72%" }} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: eventsAttended.length, label: "Events",       icon: "🎉" },
              { value: jobsApplied.length,    label: "Applications", icon: "📤" },
              { value: eventsCreated.length,  label: "Created",      icon: "🚀" },
              { value: activities.length,     label: "Activities",   icon: "⚡" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 bg-[var(--muted)] rounded-xl">
                <p className="text-lg font-bold text-[var(--foreground)]">{s.icon} {s.value}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Skills */}
          <Card>
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 mb-2">
                {p.skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
                    {s}
                    {editing && (
                      <button onClick={() => removeSkill(s)} className="ml-1 text-brand-500 hover:text-red-500 transition-colors leading-none">×</button>
                    )}
                  </span>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2 mt-2">
                  <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    placeholder="Add skill…"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
                  <button onClick={addSkill} className="px-3 py-1.5 text-xs font-semibold gradient-brand text-white rounded-lg">Add</button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader><CardTitle>Interests</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 mb-2">
                {p.interests.map((i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--foreground)]">
                    {i}
                    {editing && (
                      <button onClick={() => removeInterest(i)} className="ml-1 text-slate-400 hover:text-red-500 transition-colors leading-none">×</button>
                    )}
                  </span>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2 mt-2">
                  <input value={newInterest} onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addInterest()}
                    placeholder="Add interest…"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
                  <button onClick={addInterest} className="px-3 py-1.5 text-xs font-semibold gradient-brand text-white rounded-lg">Add</button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader><CardTitle>Education</CardTitle></CardHeader>
            <CardContent className="pt-0">
              {editing ? (
                <div className="space-y-3">
                  <Input label="Degree" value={draft.degree} onChange={(e) => setDraft((d) => ({ ...d, degree: e.target.value }))} />
                  <Input label="College / University" value={draft.college} onChange={(e) => setDraft((d) => ({ ...d, college: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Graduation Year" value={draft.batch} onChange={(e) => setDraft((d) => ({ ...d, batch: e.target.value }))} />
                    <Input label="CGPA" value={draft.cgpa} onChange={(e) => setDraft((d) => ({ ...d, cgpa: e.target.value }))} />
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-brand-100 rounded-xl flex items-center justify-center text-xl shrink-0">🎓</div>
                  <div>
                    <p className="text-sm font-semibold">{p.degree}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{p.college} · 2022–{p.batch}</p>
                    <p className="text-xs text-emerald-600 font-medium">CGPA: {p.cgpa}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Badges */}
          <Card>
            <CardHeader><CardTitle>Badges & Achievements</CardTitle></CardHeader>
            <CardContent className="pt-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badgesList.map((b) => (
                <div key={b.label} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)] hover-lift cursor-default">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center text-xl shrink-0`}>
                    {b.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--foreground)] truncate">{b.label}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] truncate">{b.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Events Attended */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Events I Attended</CardTitle>
              <span className="text-xs text-[var(--muted-foreground)]">{eventsAttended.length} total</span>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {eventsAttended.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-xs text-[var(--muted-foreground)]">No events yet. <Link href="/events" className="text-[var(--primary)] hover:underline">Explore events →</Link></p>
                </div>
              ) : eventsAttended.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                  <div className="h-9 w-9 bg-gradient-to-br from-violet-400 to-blue-500 rounded-xl flex items-center justify-center text-lg shrink-0">{TYPE_ICONS[a.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--foreground)] truncate">{a.itemTitle}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">{a.itemDetails ?? ""}</p>
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] whitespace-nowrap shrink-0">{new Date(a.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Jobs Applied */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Jobs Applied</CardTitle>
              <span className="text-xs text-[var(--muted-foreground)]">{jobsApplied.length} total</span>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {jobsApplied.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">💼</p>
                  <p className="text-xs text-[var(--muted-foreground)]">No applications yet. <Link href="/jobs" className="text-[var(--primary)] hover:underline">Browse jobs →</Link></p>
                </div>
              ) : jobsApplied.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                  <div className="h-9 w-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-lg shrink-0">💼</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--foreground)] truncate">{a.itemTitle}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">{a.itemDetails ?? ""}</p>
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] whitespace-nowrap shrink-0">{new Date(a.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Account actions */}
      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600 text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-red-600 hover:border-red-300"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setShowDeleteModal(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete account
          </Button>
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Delete your account?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This will permanently delete your account for <span className="font-semibold text-slate-700">{profile.email}</span>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating save bar when editing */}
      {editing && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl animate-slide-up">
          <span className="text-sm font-medium">Unsaved changes</span>
          <Button variant="outline" size="sm" onClick={handleCancel} className="border-white/30 text-white hover:bg-white/10">Cancel</Button>
          <Button size="sm" onClick={handleSave} className="bg-white text-slate-900 hover:bg-slate-100 font-bold">Save changes</Button>
        </div>
      )}
    </div>
  );
}
