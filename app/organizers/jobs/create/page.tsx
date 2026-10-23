"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const JOB_TYPES   = ["Full-time", "Internship", "Part-time", "Freelance", "Contract"];
const WORK_MODES  = ["Remote", "On-site", "Hybrid"];
const DEPARTMENTS = ["Engineering", "Design", "Product", "Marketing", "Sales", "Operations", "Finance", "HR", "Research", "Other"];
const DURATIONS   = ["1 Month", "2 Months", "3 Months", "6 Months", "1 Year"];

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
        <Button variant="gradient" size="sm" asChild><Link href="/organizers/dashboard">My Listings</Link></Button>
      </div>
    </header>
  );
}

export default function PostJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    company: "",
    jobType: "Internship",
    department: "Engineering",
    workMode: "Remote",
    location: "",
    minSalary: "",
    maxSalary: "",
    stipend: "",
    duration: "3 Months",
    openings: "",
    deadline: "",
    description: "",
    responsibilities: "",
    requirements: "",
    skills: [] as string[],
    perks: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !form.skills.includes(v)) setForm((f) => ({ ...f, skills: [...f.skills, v] }));
    setSkillInput("");
  };
  const removeSkill = (s: string) => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));

  const handlePublish = async () => {
    if (!form.title || !form.company || !form.description) {
      alert("Please fill in the job title, company name, and description.");
      return;
    }
    const organizerEmail = session?.user?.email;
    const organizerName  = session?.user?.name ?? "Organizer";
    if (!organizerEmail) {
      alert("Please sign in to post a job.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, organizerEmail, organizerName, status: "published" }),
      });
      const { job } = await res.json();
      // Track as activity so it shows in organizer dashboard
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: organizerEmail,
          type: "job-posted",
          itemId: job.id,
          itemTitle: job.title,
          itemDetails: `${job.company} · ${job.location || "Remote"} · ${job.jobType}`,
        }),
      });
      setPublished(true);
      setTimeout(() => router.push("/organizers/dashboard"), 2500);
    } catch {
      alert("Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (published) {
    return (
      <div className="min-h-screen bg-[var(--muted)] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md shadow-lg">
          <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Posted!</h2>
          <p className="text-slate-500 text-sm mb-6">
            <span className="font-semibold text-slate-700">&quot;{form.title}&quot;</span> at <span className="font-semibold text-slate-700">{form.company}</span> is now live. Applications will start coming in shortly!
          </p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full gradient-brand rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }

  const isInternship = form.jobType === "Internship";

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      <OrgHeader />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Post a Job / Internship</h1>
          <p className="text-slate-500 text-sm mt-0.5">Reach thousands of qualified students and professionals</p>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Role Details</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Job title *" placeholder="e.g. Frontend Developer Intern" value={form.title} onChange={set("title")} />
              <Input label="Company / Organization *" placeholder="e.g. Google India" value={form.company} onChange={set("company")} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Job type *</label>
                <select value={form.jobType} onChange={set("jobType")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
                  {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Department</label>
                <select value={form.department} onChange={set("department")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Work mode *</label>
                <select value={form.workMode} onChange={set("workMode")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
                  {WORK_MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {form.workMode !== "Remote" && (
              <Input label="Location" placeholder="e.g. Bangalore, Karnataka" value={form.location} onChange={set("location")} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {isInternship ? (
                <>
                  <Input label="Stipend (₹/month)" type="number" placeholder="e.g. 15000" value={form.stipend} onChange={set("stipend")} />
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Duration</label>
                    <select value={form.duration} onChange={set("duration")}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
                      {DURATIONS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <Input label="Min salary (₹/yr)" type="number" placeholder="e.g. 600000" value={form.minSalary} onChange={set("minSalary")} />
                  <Input label="Max salary (₹/yr)" type="number" placeholder="e.g. 1200000" value={form.maxSalary} onChange={set("maxSalary")} />
                </>
              )}
              <Input label="Openings" type="number" placeholder="e.g. 5" value={form.openings} onChange={set("openings")} />
            </div>

            <Input label="Application deadline *" type="date" value={form.deadline} onChange={set("deadline")} />
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader><CardTitle>Job Description</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">About the role *</label>
              <textarea rows={4} value={form.description} onChange={set("description")}
                placeholder="Describe the role, the team, what you're building, and why someone should join…"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Key responsibilities</label>
              <textarea rows={4} value={form.responsibilities} onChange={set("responsibilities")}
                placeholder="• Design and develop React components&#10;• Work closely with the product team&#10;• Write clean, tested code"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Requirements & qualifications</label>
              <textarea rows={3} value={form.requirements} onChange={set("requirements")}
                placeholder="e.g. B.Tech in CS or related · 2+ years experience with React · Strong problem-solving skills"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all" />
            </div>
          </CardContent>
        </Card>

        {/* Skills & Perks */}
        <Card>
          <CardHeader><CardTitle>Skills & Perks</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Required skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
                    {s}
                    <button onClick={() => removeSkill(s)} className="ml-0.5 text-brand-400 hover:text-red-500 transition-colors leading-none">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Type a skill and press Enter… e.g. React, Python, Figma"
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
                <Button variant="outline" size="sm" onClick={addSkill}>Add</Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Perks & benefits</label>
              <textarea rows={2} value={form.perks} onChange={set("perks")}
                placeholder="e.g. Letter of Recommendation, Pre-Placement Offer, Flexible hours, Free lunch"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all" />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pb-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/organizers/dashboard">Cancel</Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => alert("Draft saved!")}>Save as draft</Button>
          <Button variant="gradient" size="lg" loading={submitting} onClick={handlePublish}>Post Job →</Button>
        </div>
      </div>
    </div>
  );
}
