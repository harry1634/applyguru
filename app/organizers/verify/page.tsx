"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ORG_TYPES = [
  "College / University",
  "Startup",
  "Enterprise / MNC",
  "NGO / Non-profit",
  "Government Body",
  "Individual Organizer",
  "Other",
];

const steps = ["Organisation Details", "Documents", "Review & Submit"];

function OrgHeader() {
  return (
    <header className="h-16 border-b border-[var(--border)] bg-white flex items-center px-6 justify-between sticky top-0 z-30">
      <Link href="/organizers" className="flex items-center gap-2">
        <div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">AG</span>
        </div>
        <span className="font-bold text-base"><span className="gradient-text">Apply</span><span className="text-slate-900">Guru</span></span>
        <span className="ml-2 text-xs text-slate-400 font-medium hidden sm:inline">/ Organizer Verification</span>
      </Link>
      <Button variant="outline" size="sm" asChild>
        <Link href="/organizers/dashboard">← Dashboard</Link>
      </Button>
    </header>
  );
}

export default function VerifyPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    orgName: "",
    orgType: "Startup",
    website: "",
    linkedin: "",
    regNumber: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    description: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--muted)]">
        <OrgHeader />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Verification Under Review</h2>
          <p className="text-slate-500 mb-6">
            We&apos;ve received your application for <span className="font-semibold text-slate-700">{form.orgName || "your organisation"}</span>. Our team will review your documents and get back to you within <span className="font-semibold text-slate-700">2–3 business days</span> via email.
          </p>
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5 text-left space-y-3 mb-8">
            {[
              { label: "Application ID",    value: `VRF-${Date.now().toString().slice(-6)}` },
              { label: "Organisation",      value: form.orgName || "—" },
              { label: "Contact email",     value: form.contactEmail || "—" },
              { label: "Expected response", value: "Within 2–3 business days" },
              { label: "Status",            value: "🟡 Under Review" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-slate-500">{r.label}</span>
                <span className="font-medium text-slate-800">{r.value}</span>
              </div>
            ))}
          </div>
          <Button variant="gradient" asChild>
            <Link href="/organizers/dashboard">Go to Dashboard →</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      <OrgHeader />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="rounded-2xl gradient-brand p-6 text-white">
          <div className="flex items-start gap-4">
            <span className="text-4xl">✅</span>
            <div>
              <h1 className="text-xl font-bold mb-1">Get Verified as an Organizer</h1>
              <p className="text-blue-100 text-sm">
                Verified organizers get a trust badge, priority listing, and access to advanced analytics. The process takes 2–3 business days.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "🏅", label: "Trust Badge",     desc: "on all listings" },
            { icon: "📈", label: "Priority Rank",   desc: "in search results" },
            { icon: "📊", label: "Analytics Pro",   desc: "detailed insights" },
            { icon: "💬", label: "Dedicated Support",desc: "priority queue" },
          ].map((b) => (
            <div key={b.label} className="bg-white rounded-xl border border-[var(--border)] p-4 text-center">
              <div className="text-2xl mb-1">{b.icon}</div>
              <p className="text-xs font-bold text-slate-800">{b.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                i < step ? "bg-emerald-500 text-white" : i === step ? "gradient-brand text-white" : "bg-slate-200 text-slate-400"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-slate-800" : "text-slate-400"}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-emerald-400" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Org Details */}
        {step === 0 && (
          <Card>
            <CardHeader><CardTitle>Organisation Details</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Organisation name *" placeholder="e.g. TechCorp India Pvt. Ltd." value={form.orgName} onChange={set("orgName")} />
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Organisation type *</label>
                  <select value={form.orgType} onChange={set("orgType")}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
                    {ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Website" type="url" placeholder="https://techcorp.in" value={form.website} onChange={set("website")} />
                <Input label="LinkedIn page" type="url" placeholder="https://linkedin.com/company/…" value={form.linkedin} onChange={set("linkedin")} />
              </div>
              <Input label="Registration / CIN number (if applicable)" placeholder="e.g. U72900KA2015PTC082078" value={form.regNumber} onChange={set("regNumber")} />
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Brief description *</label>
                <textarea rows={3} value={form.description} onChange={set("description")}
                  placeholder="Tell us about your organisation — what you do, the events you host, and why you want to be verified."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all" />
              </div>
              <div className="pt-2 flex justify-end">
                <Button variant="gradient" onClick={() => {
                  if (!form.orgName || !form.description) { alert("Please fill in organisation name and description."); return; }
                  setStep(1);
                }}>Continue →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Documents */}
        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Upload Documents</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-5">
              <p className="text-sm text-slate-500">Upload at least one of the following to verify your organisation.</p>

              {[
                { label: "Certificate of Incorporation / Registration",  hint: "PDF · Max 5MB",   required: true },
                { label: "Government ID of authorised representative",   hint: "JPG/PDF · Max 5MB", required: true },
                { label: "GST Certificate (if applicable)",             hint: "PDF · Max 5MB",   required: false },
                { label: "PAN Card of organisation",                     hint: "JPG/PDF · Max 5MB", required: false },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] border-dashed hover:border-brand-400 transition-colors cursor-pointer group">
                  <div className="h-12 w-12 bg-slate-100 group-hover:bg-brand-50 rounded-xl flex items-center justify-center text-2xl transition-colors">📄</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{doc.label} {doc.required && <span className="text-red-500">*</span>}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{doc.hint}</p>
                  </div>
                  <Button variant="outline" size="sm">Upload</Button>
                </div>
              ))}

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold text-slate-800">Point of Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Full name *" placeholder="Arjun Mehta" value={form.contactName} onChange={set("contactName")} />
                  <Input label="Email *" type="email" placeholder="arjun@techcorp.in" value={form.contactEmail} onChange={set("contactEmail")} />
                  <Input label="Phone *" type="tel" placeholder="+91 98765 43210" value={form.contactPhone} onChange={set("contactPhone")} />
                </div>
              </div>

              <div className="flex gap-3 pt-2 justify-between">
                <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
                <Button variant="gradient" onClick={() => {
                  if (!form.contactName || !form.contactEmail) { alert("Please fill in the contact details."); return; }
                  setStep(2);
                }}>Continue →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Review & Submit</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-5">
              <div className="bg-[var(--muted)] rounded-xl p-4 space-y-2.5">
                {[
                  { label: "Organisation",  value: form.orgName || "—" },
                  { label: "Type",          value: form.orgType },
                  { label: "Website",       value: form.website || "—" },
                  { label: "Contact",       value: form.contactName ? `${form.contactName} · ${form.contactEmail}` : "—" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{r.label}</span>
                    <span className="font-medium text-slate-800 text-right max-w-[60%] truncate">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">⚠️ Before you submit</p>
                <ul className="space-y-1 text-xs">
                  <li>• Ensure all uploaded documents are clear and legible</li>
                  <li>• Information must match the official registration documents</li>
                  <li>• False information will result in permanent account suspension</li>
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-violet-600" required />
                <span className="text-xs text-slate-600">
                  I confirm that all information provided is accurate and I am authorised to represent this organisation. I agree to the{" "}
                  <Link href="/terms" className="text-[var(--primary)] hover:underline">Terms of Service</Link> and{" "}
                  <Link href="/privacy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>.
                </span>
              </label>

              <div className="flex gap-3 pt-2 justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                <Button variant="gradient" loading={submitting} onClick={handleSubmit}>
                  Submit for Verification →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
