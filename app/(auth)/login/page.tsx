"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" fill="#0077B5" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "linkedin" | null>(null);
  const [error, setError]               = useState("");

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const urlError = searchParams?.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password)     { setError("Please enter your password."); return; }

    setLoading(true);

    try {
      // 1. Check if this email is registered
      const check = await fetch(`/api/users?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      const { user } = await check.json();

      if (!user) {
        setError("No account found with this email. Please sign up first.");
        setLoading(false);
        return;
      }

      // 2. Sign in with credentials
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Sign-in failed. Please check your details and try again.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "linkedin") => {
    if (provider === "linkedin") {
      setError("LinkedIn sign-in is not available yet. Please use Google to sign in.");
      return;
    }
    setOauthLoading(provider);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setOauthLoading(null);
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand relative overflow-hidden flex-col items-center justify-center p-12 text-white">
        <div className="absolute inset-0 mesh-hero opacity-30" />
        <div className="relative z-10 max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="font-bold text-lg">AG</span>
            </div>
            <span className="font-bold text-2xl">ApplyGuru</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4 leading-tight">Welcome back to your opportunities</h1>
          <p className="text-blue-100 text-lg mb-10">Access 63,000+ events, jobs, workshops, and career guidance sessions waiting for you.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "50K+", label: "Live Events" },
              { value: "18K+", label: "Job Openings" },
              { value: "4.9★", label: "App Rating" },
              { value: "98%",  label: "Satisfaction" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-blue-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 bg-white overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AG</span>
          </div>
          <span className="font-bold text-lg"><span className="gradient-text">Apply</span>Guru</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
            <p className="text-slate-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[var(--primary)] font-semibold hover:underline">Sign up free</Link>
            </p>
          </div>

          {/* NextAuth error from redirect */}
          {urlError && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
              <span className="shrink-0">⚠️</span>
              <div>
                <p className="font-semibold">Google sign-in failed: <code className="bg-red-100 px-1 rounded">{urlError}</code></p>
                {urlError === "access_denied" && <p className="mt-1">Your Google account is not added as a test user in Google Cloud Console.</p>}
                {urlError === "OAuthCallback" && (
                  <ol className="mt-2 space-y-1 text-xs list-decimal list-inside">
                    <li>Go to <strong>console.cloud.google.com</strong> → APIs &amp; Services → Credentials</li>
                    <li>Click your OAuth 2.0 Client ID</li>
                    <li>Under <strong>Authorized JavaScript origins</strong>, add: <code className="bg-red-100 px-1 rounded">http://localhost:3000</code></li>
                    <li>Under <strong>Authorized redirect URIs</strong>, add: <code className="bg-red-100 px-1 rounded">http://localhost:3000/api/auth/callback/google</code></li>
                    <li>Click <strong>Save</strong> and wait 1–2 minutes, then try again</li>
                  </ol>
                )}
              </div>
            </div>
          )}

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button type="button" onClick={() => handleOAuth("google")} disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-[var(--border)] bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              {oauthLoading === "google" ? (
                <svg className="animate-spin w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : <GoogleIcon />}
              Continue with Google
            </button>
            <button type="button" onClick={() => handleOAuth("linkedin")} disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-[var(--border)] bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              <LinkedInIcon />
              Continue with LinkedIn
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-slate-400 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Input label="Email address" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input label="Password" type={showPassword ? "text" : "password"} placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-[var(--border)] accent-violet-600" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[var(--primary)] hover:underline font-medium">Forgot password?</Link>
            </div>

            <Button type="submit" variant="gradient" size="lg" loading={loading} className="w-full">
              Sign in →
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-[var(--primary)] hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
