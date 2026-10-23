"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--muted)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card p-8">
          <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AG</span>
            </div>
            <span className="font-bold text-lg"><span className="gradient-text">Apply</span>Guru</span>
          </Link>

          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="h-14 w-14 gradient-brand rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🔒</div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot password?</h1>
                <p className="text-slate-500 text-sm">No worries! Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="gradient" size="lg" loading={loading} className="w-full">
                  Send reset link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox!</h2>
              <p className="text-slate-500 text-sm mb-6">
                We sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>. It expires in 15 minutes.
              </p>
              <p className="text-xs text-slate-400 mb-6">Didn&apos;t receive it? Check your spam folder.</p>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Try a different email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-[var(--primary)] hover:underline font-medium">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
