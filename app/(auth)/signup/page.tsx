"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const roles = [
  { id: "participant", label: "Student / Job Seeker", icon: "🎓", desc: "Find events, jobs & opportunities" },
  { id: "organizer",  label: "Organizer / Company",  icon: "🏢", desc: "Post events, jobs & workshops" },
  { id: "counselor",  label: "Mentor / Counselor",   icon: "🎯", desc: "Offer career guidance sessions" },
];

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState("participant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Please enter your name."); return; }
    if (!form.email.trim()) { setError("Please enter your email."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Save user to database
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, role: selectedRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Sign-up failed. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Sign in with credentials to create real session
      const result = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please go to login.");
        setLoading(false);
        return;
      }

      // 3. Redirect to onboarding with role so onboarding can skip the role-selection step
      window.location.href = `/onboarding?role=${selectedRole}`;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-slate-950 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(at 30% 20%, rgba(139,92,246,0.3) 0px, transparent 60%), radial-gradient(at 80% 80%, rgba(59,130,246,0.2) 0px, transparent 60%)"
        }} />
        <div className="relative z-10 max-w-xs text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-10">
            <div className="h-10 w-10 gradient-brand rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">AG</span>
            </div>
            <span className="font-bold text-2xl text-white">ApplyGuru</span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-4">Start your journey today</h2>
          <p className="text-slate-400 mb-8">Join 500,000+ students and professionals discovering opportunities daily.</p>
          <div className="text-left space-y-4">
            {[
              { icon: "⚡", text: "Instant access to 63,000+ opportunities" },
              { icon: "🤖", text: "AI-powered personalized recommendations" },
              { icon: "🏆", text: "Earn XP, badges & verified certificates" },
              { icon: "📱", text: "Mobile app with QR check-in scanner" },
              { icon: "💡", text: "Free career counseling sessions" },
            ].map((b) => (
              <div key={b.text} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{b.icon}</span>
                <p className="text-slate-300 text-sm">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 bg-white overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AG</span>
          </div>
          <span className="font-bold text-lg"><span className="gradient-text">Apply</span>Guru</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "gradient-brand text-white" : "bg-slate-100 text-slate-400"}`}>
                  {step > s ? "✓" : s}
                </div>
                {s < 2 && <div className={`h-px w-10 transition-all ${step > s ? "bg-brand-500" : "bg-slate-200"}`} />}
              </div>
            ))}
            <span className="text-xs text-slate-400 ml-2">Step {step} of 2</span>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
                <p className="text-slate-500 text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">Sign in</Link>
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Google OAuth shortcut */}
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-[var(--border)] bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 active:scale-[0.98]"
              >
                <GoogleIcon />
                Sign up with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-slate-400 font-medium">or with email</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <Input label="Full name" type="text" placeholder="Riya Sharma"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email address" type="email" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Password" type="password" placeholder="At least 6 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                hint="Used to sign in later" />

              <Button type="submit" variant="gradient" size="lg" className="w-full">Continue →</Button>

              <p className="text-center text-xs text-slate-400">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-[var(--primary)] hover:underline">Terms</Link> and{" "}
                <Link href="/privacy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">I am joining as a…</h2>
                <p className="text-slate-500 text-sm">We&apos;ll personalise your experience based on your role</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="space-y-3">
                {roles.map((role) => (
                  <button key={role.id} type="button" onClick={() => setSelectedRole(role.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedRole === role.id ? "border-[var(--primary)] bg-brand-50" : "border-[var(--border)] hover:border-slate-300"
                    }`}>
                    <span className="text-2xl">{role.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${selectedRole === role.id ? "text-[var(--primary)]" : "text-slate-800"}`}>{role.label}</p>
                      <p className="text-xs text-slate-500">{role.desc}</p>
                    </div>
                    {selectedRole === role.id && (
                      <div className="h-5 w-5 rounded-full gradient-brand flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => { setStep(1); setError(""); }}>
                  ← Back
                </Button>
                <Button type="submit" variant="gradient" size="lg" className="flex-1" loading={loading}>
                  Create account 🎉
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
