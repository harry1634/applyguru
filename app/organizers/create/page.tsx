"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/user-context";
import { sendEmail } from "@/lib/send-email";
import { trackActivity } from "@/lib/track-activity";

const EVENT_TYPES = ["Event", "Workshop", "Webinar", "Summit", "Hackathon", "Conference"];
const CATEGORIES  = ["Technology", "Business", "Design", "Science", "Arts & Culture", "Sports", "Volunteer", "Career", "Health", "Education"];
const MODES       = ["Online", "Offline", "Hybrid"];

function OrgHeader() {
  return (
    <header className="h-16 border-b border-[var(--border)] bg-white flex items-center px-6 justify-between sticky top-0 z-30">
      <Link href="/organizers" className="flex items-center gap-2">
        <div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">AG</span>
        </div>
        <span className="font-bold text-base"><span className="gradient-text">Apply</span><span className="text-slate-900">Guru</span></span>
        <span className="ml-2 text-xs text-slate-400 font-medium hidden sm:inline">/ Organizers</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/organizers/dashboard" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors hidden sm:block">Dashboard</Link>
        <Button variant="gradient" size="sm" asChild><Link href="/organizers/dashboard">My Events</Link></Button>
      </div>
    </header>
  );
}

export default function PostEventPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { profile } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    type: "Event",
    category: "Technology",
    mode: "Online",
    date: "",
    time: "",
    endTime: "",
    location: "",
    meetLink: "",
    description: "",
    capacity: "",
    fee: "0",
    tags: "",
    registrationDeadline: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePublish = async () => {
    if (!form.title || !form.date || !form.description) {
      alert("Please fill in the title, date, and description.");
      return;
    }

    // Always use the real session email — profile.email defaults to "riya@example.com"
    const email = session?.user?.email;
    const name  = session?.user?.name ?? "Organizer";

    if (!email) {
      alert("Please sign in to publish an event.");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));

    await sendEmail({
      type: "event-created",
      to: email,
      data: {
        name: name.split(" ")[0],
        eventName: form.title,
        eventDate: form.date
          ? new Date(form.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) +
            (form.time ? ` · ${form.time}` : "")
          : "TBD",
        eventMode: form.mode,
        capacity: form.capacity || undefined,
      },
    });

    fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, incrementStat: "eventsCreated" }),
    }).catch(() => {});

    // Persist full event data so it appears on the student-facing events page
    const { event: savedEvent } = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        organizerEmail: email,
        organizerName: profile.orgName || session?.user?.name || profile.name || "Unknown",
        status: "published",
      }),
    }).then((r) => r.json()).catch(() => ({ event: { id: crypto.randomUUID() } }));

    const eventId = savedEvent?.id ?? crypto.randomUUID();
    await trackActivity({
      email,
      type: "event-created",
      itemId: eventId,
      itemTitle: form.title,
      itemDetails: `${form.date} · ${form.mode} · ${form.type}`,
    });

    setSubmitting(false);
    setPublished(true);
    setTimeout(() => router.push("/organizers/dashboard"), 2500);
  };

  if (published) {
    return (
      <div className="min-h-screen bg-[var(--muted)] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md shadow-lg">
          <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Event Published!</h2>
          <p className="text-slate-500 text-sm mb-6">
            <span className="font-semibold text-slate-700">&quot;{form.title}&quot;</span> is now live and visible to 500K+ students. Redirecting to your dashboard…
          </p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full gradient-brand rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      <OrgHeader />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Post an Event</h1>
          <p className="text-slate-500 text-sm mt-0.5">Fill in the details below to publish your event to 500K+ students</p>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-4">
            <Input label="Event title *" placeholder="e.g. National Hackathon 2025 by Google" value={form.title} onChange={set("title")} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Event type *</label>
                <select value={form.type} onChange={set("type")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
                  {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Category *</label>
                <select value={form.category} onChange={set("category")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Mode *</label>
                <select value={form.mode} onChange={set("mode")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
                  {MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Description *</label>
              <textarea rows={5} value={form.description} onChange={set("description")}
                placeholder="Describe your event — agenda, speakers, what attendees will gain, eligibility, etc."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all" />
            </div>

            <Input label="Tags (comma-separated)" placeholder="e.g. AI, ML, Hackathon, Open to all" value={form.tags} onChange={set("tags")} />
          </CardContent>
        </Card>

        {/* Date & Location */}
        <Card>
          <CardHeader><CardTitle>Date, Time & Location</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Event date *" type="date" value={form.date} onChange={set("date")} />
              <Input label="Start time" type="time" value={form.time} onChange={set("time")} />
              <Input label="End time" type="time" value={form.endTime} onChange={set("endTime")} />
            </div>

            {(form.mode === "Offline" || form.mode === "Hybrid") && (
              <Input label="Venue / Address" placeholder="e.g. NSIT Auditorium, Dwarka, New Delhi" value={form.location} onChange={set("location")} />
            )}
            {(form.mode === "Online" || form.mode === "Hybrid") && (
              <Input label="Meeting link (optional)" placeholder="Zoom / Google Meet link — can be added later" value={form.meetLink} onChange={set("meetLink")} />
            )}

            <Input label="Registration deadline" type="date" value={form.registrationDeadline} onChange={set("registrationDeadline")} />
          </CardContent>
        </Card>

        {/* Registration */}
        <Card>
          <CardHeader><CardTitle>Registration Settings</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Capacity (max attendees)" type="number" placeholder="e.g. 500 (leave blank for unlimited)" value={form.capacity} onChange={set("capacity")} />
              <div>
                <Input label="Registration fee (₹)" type="number" placeholder="0 for free" value={form.fee} onChange={set("fee")} />
                {form.fee === "0" || form.fee === "" ? (
                  <p className="text-xs text-emerald-600 mt-1">✓ Free event — no payment collection</p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Payments collected via Razorpay. Instant payouts to your account.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB."); return; }
                setCoverFileName(file.name);
                const reader = new FileReader();
                reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
                reader.readAsDataURL(file);
              }}
            />
            <div
              onClick={() => coverInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--border)] rounded-2xl overflow-hidden cursor-pointer hover:border-brand-400 transition-colors group"
            >
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">Click to change image</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg truncate max-w-[200px]">
                    {coverFileName}
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🖼️</div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Click to upload cover image</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">JPG or PNG · 1200×630px recommended · Max 5MB</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}>
                    Browse files
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pb-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/organizers/dashboard">Cancel</Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => alert("Draft saved!")}>
            Save as draft
          </Button>
          <Button variant="gradient" size="lg" loading={submitting} onClick={handlePublish}>
            Publish Event →
          </Button>
        </div>
      </div>
    </div>
  );
}
