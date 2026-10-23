"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/lib/user-context";

type UserType = "student" | "graduate" | "organization" | "counselor";

const DEGREES        = ["B.Tech / B.E.", "BCA", "BBA", "B.Sc", "B.Com", "B.A.", "M.Tech", "MBA", "MCA", "M.Sc", "PhD", "Diploma", "Other"];
const ORG_TYPES      = ["Company / Startup", "NGO / Non-profit", "College / University", "Government Body", "Event Agency", "Other"];
const EXPERTISE_AREAS = ["Engineering / Technology", "MBA / Business", "Medical / Science", "Arts & Humanities", "Government Jobs / UPSC", "Data Science / AI", "Design / UX", "Finance / CFA / CA", "Law", "Other"];
const STATES         = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Other"];

/* ─── Shared OTP hook ─── */
function useOTP() {
  const [sent,     setSent]     = useState(false);
  const [code,     setCode]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [devOtp,   setDevOtp]   = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const reset = () => { setSent(false); setCode(""); setError(""); setDevOtp(""); };
  return { sent, setSent, code, setCode, loading, setLoading, error, setError, cooldown, setCooldown, devOtp, setDevOtp, reset };
}

/* ─── Phone field (no OTP — plain input) ─── */
function PhoneField({ digits, onDigitsChange, label }: {
  digits: string; onDigitsChange: (v: string) => void; label?: string;
}) {
  const base = "px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-slate-400 w-full";
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label ?? "Mobile Number"} *</label>
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 px-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 shrink-0">🇮🇳 +91</div>
        <input className={base + " flex-1"} type="tel" inputMode="numeric" value={digits} maxLength={10} placeholder="10-digit number"
          onChange={(e) => onDigitsChange(e.target.value.replace(/\D/g, "").slice(0, 10))} />
      </div>
      {digits.length > 0 && digits.length < 10 && <p className="mt-1 text-xs text-slate-400">Enter your 10-digit mobile number</p>}
    </div>
  );
}

/* ─── Email verification field ─── */
function EmailOTPField({ email, verified, onVerified, autoVerified }: {
  email: string; verified: boolean; onVerified: () => void; autoVerified?: boolean;
}) {
  const otp = useOTP();

  const handleSend = async () => {
    otp.setLoading(true); otp.setError("");
    const res  = await fetch("/api/email-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, action: "send" }) });
    const data = await res.json();
    otp.setLoading(false);
    if (!res.ok) { otp.setError(data.error); return; }
    otp.setSent(true); otp.setCooldown(60);
    if (data.devCode) otp.setDevOtp(data.devCode); // shown when email delivery is restricted
  };

  const handleVerify = async () => {
    otp.setLoading(true); otp.setError("");
    const res  = await fetch("/api/email-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, action: "verify", otp: otp.code }) });
    const data = await res.json();
    otp.setLoading(false);
    if (!res.ok) { otp.setError(data.error); return; }
    onVerified();
  };

  const base = "px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-slate-400 w-full";

  if (verified) return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Verification *</label>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50">
        <span className="text-sm font-medium text-slate-700 truncate">✉️ {email}</span>
        <span className="ml-auto flex items-center gap-1 text-emerald-600 text-xs font-semibold shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {autoVerified ? "Google verified" : "Verified"}
        </span>
      </div>
    </div>
  );

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Verification *</label>
      <div className="flex gap-2">
        <div className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-600 truncate">✉️ {email}</div>
        <button type="button" onClick={handleSend} disabled={!email || otp.loading || (otp.sent && otp.cooldown > 0)}
          className="px-3 py-2.5 rounded-xl gradient-brand text-white text-xs font-semibold disabled:opacity-40 shrink-0 min-w-[90px]">
          {otp.loading && !otp.sent ? "…" : otp.sent ? (otp.cooldown > 0 ? `Resend ${otp.cooldown}s` : "Resend") : "Send Code"}
        </button>
      </div>
      {otp.sent && (
        <div className="mt-2 flex gap-2">
          <input className={base + " text-center tracking-[0.3em] font-semibold"} type="text" inputMode="numeric" maxLength={6} value={otp.code} placeholder="6-digit code"
            onChange={(e) => { otp.setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); otp.setError(""); }} />
          <button type="button" onClick={handleVerify} disabled={otp.code.length !== 6 || otp.loading}
            className="px-4 rounded-xl gradient-brand text-white text-xs font-semibold disabled:opacity-40 shrink-0">{otp.loading ? "…" : "Verify"}</button>
        </div>
      )}
      {otp.devOtp && (
        <p className="mt-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-2">
          📬 Email not delivered (Resend free-tier restriction) — use code: <strong>{otp.devOtp}</strong>
        </p>
      )}
      {otp.error && <p className="mt-1 text-xs text-red-500">{otp.error}</p>}
      {otp.sent && !verified && !otp.devOtp && <p className="mt-1 text-xs text-slate-400">Check your inbox (and spam folder) for the 6-digit code</p>}
      {!otp.sent && <p className="mt-1 text-xs text-slate-400">Click Send Code — we&apos;ll email a 6-digit code to verify your address</p>}
    </div>
  );
}

/* ─── Main page ─── */
export default function OnboardingPage() {
  const { data: session } = useSession();
  const { updateProfile } = useUser();

  const email      = session?.user?.email ?? "";
  const googleName = session?.user?.name  ?? "";

  const [step,       setStep]       = useState(1);
  const [userType,   setUserType]   = useState<UserType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Profile photo
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Email verification — auto-verified for Google OAuth users
  const [emailVerified,     setEmailVerified]     = useState(false);
  const [emailAutoVerified, setEmailAutoVerified] = useState(false);

  // Student / Graduate
  const [name,     setName]     = useState(googleName);
  const [username, setUsername] = useState("");
  const [phone,    setPhone]    = useState("");
  const [college,  setCollege]  = useState("");
  const [degree,   setDegree]   = useState("");
  const [gradYear, setGradYear] = useState("");
  const [city,     setCity]     = useState("");
  const [state,    setState]    = useState("");

  // Organization
  const [orgName,     setOrgName]     = useState("");
  const [orgType,     setOrgType]     = useState("");
  const [contactName, setContactName] = useState(googleName);
  const [orgPhone,    setOrgPhone]    = useState("");
  const [orgCity,     setOrgCity]     = useState("");
  const [orgState,    setOrgState]    = useState("");
  const [orgWebsite,  setOrgWebsite]  = useState("");

  // Counselor / Mentor
  const [mentorName,  setMentorName]  = useState(googleName);
  const [mentorPhone, setMentorPhone] = useState("");
  const [expertise,   setExpertise]   = useState("");
  const [experience,    setExperience]    = useState("");
  const [designation,   setDesignation]   = useState("");
  const [linkedIn,      setLinkedIn]      = useState("");
  const [mentorCity,    setMentorCity]    = useState("");
  const [mentorState,   setMentorState]   = useState("");

  // Read ?role= from URL (set by signup) — skip step 1 for org/counselor
  const [roleParam, setRoleParam] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role   = params.get("role");
    setRoleParam(role);
    if (role === "organizer") { setUserType("organization"); setStep(2); }
    if (role === "counselor") { setUserType("counselor");    setStep(2); }
  }, []);

  // Auto-verify email for Google OAuth users
  useEffect(() => {
    if (!email) return;
    fetch(`/api/users?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then(({ user }) => {
        if (user?.provider === "google") {
          setEmailVerified(true);
          setEmailAutoVerified(true);
        }
      })
      .catch(() => {});
  }, [email]);

  const handleSubmit = async () => {
    setSubmitting(true);
    let payload: Record<string, string | undefined>;

    if (userType === "organization") {
      payload = { email, userType, role: "organizer", name: contactName, orgName, orgType, orgContact: `+91${orgPhone}`, city: orgCity, state: orgState, orgWebsite };
    } else if (userType === "counselor") {
      payload = { email, userType, role: "counselor", name: mentorName, phone: `+91${mentorPhone}`, expertise, experience, designation, linkedIn, city: mentorCity, state: mentorState };
    } else {
      payload = { email, userType: userType ?? "student", name, username, phone: `+91${phone}`, college, degree, graduationYear: gradYear, city, state };
    }

    await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const displayName = userType === "organization" ? contactName : userType === "counselor" ? mentorName : name;
    updateProfile({ name: displayName, email, ...(avatarPreview ? { avatar: avatarPreview } : {}) });
    window.location.href = userType === "organization" ? "/organizers/dashboard" : "/dashboard";
  };

  const inp = "w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-slate-400";
  const sel = inp + " cursor-pointer";

  const studentOK   = !!(name && phone.length === 10 && emailVerified && college && degree && gradYear);
  const orgOK       = !!(orgName && orgType && contactName && orgPhone.length === 10 && emailVerified && orgCity);
  const counselorOK = !!(mentorName && mentorPhone.length === 10 && emailVerified && expertise && experience);

  const isParticipant = roleParam === "participant";
  const skippedStep1  = roleParam === "organizer" || roleParam === "counselor";
  const totalSteps    = skippedStep1 ? 2 : 3;
  const displayStep   = skippedStep1 ? step - 1 : step;

  const CheckIcon = () => (
    <div className="ml-auto w-5 h-5 rounded-full gradient-brand flex items-center justify-center shrink-0">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    </div>
  );

  const typeOptions: { type: UserType; icon: string; title: string; desc: string }[] = isParticipant
    ? [
        { type: "student",  icon: "📚", title: "Student",  desc: "Currently studying at a college or university" },
        { type: "graduate", icon: "🎓", title: "Graduate", desc: "Already completed your degree" },
      ]
    : [
        { type: "student",      icon: "📚", title: "Student",            desc: "Currently studying at a college or university" },
        { type: "graduate",     icon: "🎓", title: "Graduate",           desc: "Already completed your degree" },
        { type: "organization", icon: "🏢", title: "Organization",       desc: "Post events, jobs, or workshops for students" },
        { type: "counselor",    icon: "🎯", title: "Mentor / Counselor", desc: "Offer career guidance sessions to students" },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 gradient-brand rounded-2xl items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">AG</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to ApplyGuru!</h1>
          <p className="text-slate-500 text-sm mt-1">Let&apos;s set up your profile in just a few steps</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${displayStep > i ? "gradient-brand" : "bg-slate-200"}`} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">

          {/* ── STEP 1: Role selection ── */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Who are you joining as?</h2>
              <p className="text-sm text-slate-500 mb-6">This helps us personalise your experience</p>
              <div className="space-y-3">
                {typeOptions.map((opt) => (
                  <button key={opt.type} onClick={() => setUserType(opt.type)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${userType === opt.type ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{opt.title}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                    {userType === opt.type && <CheckIcon />}
                  </button>
                ))}
              </div>
              <button onClick={() => userType && setStep(2)} disabled={!userType}
                className="mt-6 w-full py-3 rounded-xl gradient-brand text-white font-semibold text-sm disabled:opacity-40 transition-all hover:opacity-90">
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 2: Student / Graduate form ── */}
          {step === 2 && (userType === "student" || userType === "graduate") && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Your personal details</h2>
              <p className="text-sm text-slate-500 mb-5">Verify your contact info and tell us about yourself</p>
              <div className="space-y-4">
                {/* Profile photo */}
                <div className="flex items-center gap-4">
                  <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { alert("Photo must be under 2MB."); return; }
                      const reader = new FileReader();
                      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                  <div className="relative group cursor-pointer shrink-0" onClick={() => avatarInputRef.current?.click()}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="h-16 w-16 rounded-full object-cover ring-2 ring-violet-300" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Profile Photo <span className="text-slate-400 font-normal">(optional)</span></p>
                    <button type="button" onClick={() => avatarInputRef.current?.click()}
                      className="text-xs text-violet-600 font-semibold hover:underline">
                      {avatarPreview ? "Change photo" : "Upload photo"}
                    </button>
                    <p className="text-[10px] text-slate-400 mt-0.5">JPG or PNG · Max 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                    <input className={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username *</label>
                    <input className={inp} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. sai_2004" />
                  </div>
                </div>

                <EmailOTPField email={email} verified={emailVerified} onVerified={() => setEmailVerified(true)} autoVerified={emailAutoVerified} />
                <PhoneField digits={phone} onDigitsChange={setPhone} />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">College / University *</label>
                  <input className={inp} value={college} onChange={(e) => setCollege(e.target.value)} placeholder="e.g. VIT Vellore" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Degree *</label>
                    <select className={sel} value={degree} onChange={(e) => setDegree(e.target.value)}>
                      <option value="">Select degree</option>
                      {DEGREES.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">{userType === "student" ? "Expected Grad. Year" : "Graduation Year"} *</label>
                    <select className={sel} value={gradYear} onChange={(e) => setGradYear(e.target.value)}>
                      <option value="">Select year</option>
                      {Array.from({ length: 10 }, (_, i) => 2020 + i).map((y) => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                    <input className={inp} value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Chennai" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">State</label>
                    <select className={sel} value={state} onChange={(e) => setState(e.target.value)}>
                      <option value="">Select state</option>
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                {!skippedStep1 && <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Back</button>}
                <button onClick={() => studentOK && setStep(3)} disabled={!studentOK}
                  className="flex-1 py-3 rounded-xl gradient-brand text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Organization form ── */}
          {step === 2 && userType === "organization" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Organisation details</h2>
              <p className="text-sm text-slate-500 mb-5">Verify your contact info and tell us about your organisation</p>
              <div className="space-y-4">
                {/* Logo / profile photo */}
                <div className="flex items-center gap-4">
                  <div className="relative group cursor-pointer shrink-0" onClick={() => avatarInputRef.current?.click()}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Logo" className="h-16 w-16 rounded-xl object-cover ring-2 ring-violet-300" />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Organisation Logo <span className="text-slate-400 font-normal">(optional)</span></p>
                    <button type="button" onClick={() => avatarInputRef.current?.click()} className="text-xs text-violet-600 font-semibold hover:underline">
                      {avatarPreview ? "Change logo" : "Upload logo"}
                    </button>
                    <p className="text-[10px] text-slate-400 mt-0.5">JPG or PNG · Max 2MB</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Organisation Name *</label>
                  <input className={inp} value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. TechCorp India Pvt. Ltd." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Organisation Type *</label>
                  <select className={sel} value={orgType} onChange={(e) => setOrgType(e.target.value)}>
                    <option value="">Select type</option>
                    {ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Person Name *</label>
                  <input className={inp} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name" />
                </div>

                <EmailOTPField email={email} verified={emailVerified} onVerified={() => setEmailVerified(true)} autoVerified={emailAutoVerified} />
                <PhoneField label="Contact Number" digits={orgPhone} onDigitsChange={setOrgPhone} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">City *</label>
                    <input className={inp} value={orgCity} onChange={(e) => setOrgCity(e.target.value)} placeholder="e.g. Mumbai" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">State *</label>
                    <select className={sel} value={orgState} onChange={(e) => setOrgState(e.target.value)}>
                      <option value="">Select state</option>
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Website <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input className={inp} type="url" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} placeholder="https://yourcompany.com" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                {!skippedStep1 && <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Back</button>}
                <button onClick={() => orgOK && setStep(3)} disabled={!orgOK}
                  className="flex-1 py-3 rounded-xl gradient-brand text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Counselor / Mentor form ── */}
          {step === 2 && userType === "counselor" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Mentor details</h2>
              <p className="text-sm text-slate-500 mb-5">Verify your contact info and help students find you</p>
              <div className="space-y-4">
                {/* Profile photo */}
                <div className="flex items-center gap-4">
                  <div className="relative group cursor-pointer shrink-0" onClick={() => avatarInputRef.current?.click()}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="h-16 w-16 rounded-full object-cover ring-2 ring-violet-300" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Profile Photo <span className="text-slate-400 font-normal">(optional)</span></p>
                    <button type="button" onClick={() => avatarInputRef.current?.click()} className="text-xs text-violet-600 font-semibold hover:underline">
                      {avatarPreview ? "Change photo" : "Upload photo"}
                    </button>
                    <p className="text-[10px] text-slate-400 mt-0.5">JPG or PNG · Max 2MB</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input className={inp} value={mentorName} onChange={(e) => setMentorName(e.target.value)} placeholder="Your full name" />
                </div>

                <EmailOTPField email={email} verified={emailVerified} onVerified={() => setEmailVerified(true)} autoVerified={emailAutoVerified} />
                <PhoneField label="Mobile Number" digits={mentorPhone} onDigitsChange={setMentorPhone} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Area of Expertise *</label>
                    <select className={sel} value={expertise} onChange={(e) => setExpertise(e.target.value)}>
                      <option value="">Select area</option>
                      {EXPERTISE_AREAS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Years of Experience *</label>
                    <select className={sel} value={experience} onChange={(e) => setExperience(e.target.value)}>
                      <option value="">Select</option>
                      {["0–1 year","1–3 years","3–5 years","5–10 years","10+ years"].map((y) => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Designation</label>
                  <input className={inp} value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Senior Software Engineer at Google" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">LinkedIn Profile <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input className={inp} type="url" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                    <input className={inp} value={mentorCity} onChange={(e) => setMentorCity(e.target.value)} placeholder="e.g. Bengaluru" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">State</label>
                    <select className={sel} value={mentorState} onChange={(e) => setMentorState(e.target.value)}>
                      <option value="">Select state</option>
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                {!skippedStep1 && <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Back</button>}
                <button onClick={() => counselorOK && setStep(3)} disabled={!counselorOK}
                  className="flex-1 py-3 rounded-xl gradient-brand text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Review your details</h2>
              <p className="text-sm text-slate-500 mb-5">Everything look good? You can always edit later in Settings.</p>
              <div className="mb-6 rounded-xl border border-slate-100 overflow-hidden">
                {(userType === "student" || userType === "graduate") && [
                  ["Name",         name],
                  ["Email",        email + (emailAutoVerified ? " · Google verified" : " · Verified")],
                  ["Mobile",       `+91 ${phone}`],
                  ["Username",     username || "—"],
                  ["College",      college],
                  ["Degree",       degree],
                  [userType === "student" ? "Expected Graduation" : "Graduation Year", gradYear],
                  ["Location",     [city, state].filter(Boolean).join(", ") || "—"],
                  ["Account",      userType === "student" ? "Student" : "Graduate"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5 border-b border-slate-100 last:border-0 odd:bg-slate-50">
                    <span className="text-xs text-slate-500">{k}</span>
                    <span className="text-xs font-semibold text-slate-800 text-right max-w-[55%] truncate">{v}</span>
                  </div>
                ))}
                {userType === "organization" && [
                  ["Organisation", orgName],
                  ["Type",         orgType],
                  ["Email",        email + (emailAutoVerified ? " · Google verified" : " · Verified")],
                  ["Contact",      contactName],
                  ["Phone",        `+91 ${orgPhone}`],
                  ["Location",     [orgCity, orgState].filter(Boolean).join(", ")],
                  ["Website",      orgWebsite || "—"],
                  ["Account",      "Organisation"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5 border-b border-slate-100 last:border-0 odd:bg-slate-50">
                    <span className="text-xs text-slate-500">{k}</span>
                    <span className="text-xs font-semibold text-slate-800 text-right max-w-[55%] truncate">{v}</span>
                  </div>
                ))}
                {userType === "counselor" && [
                  ["Name",        mentorName],
                  ["Email",       email + (emailAutoVerified ? " · Google verified" : " · Verified")],
                  ["Phone",       `+91 ${mentorPhone}`],
                  ["Expertise",   expertise],
                  ["Experience",  experience],
                  ["Designation", designation || "—"],
                  ["Location",    [mentorCity, mentorState].filter(Boolean).join(", ") || "—"],
                  ["Account",     "Mentor / Counselor"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5 border-b border-slate-100 last:border-0 odd:bg-slate-50">
                    <span className="text-xs text-slate-500">{k}</span>
                    <span className="text-xs font-semibold text-slate-800 text-right max-w-[55%] truncate">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Back</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-3 rounded-xl gradient-brand text-white font-semibold text-sm disabled:opacity-60 hover:opacity-90 flex items-center justify-center gap-2">
                  {submitting
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Setting up…</>
                    : "Complete Setup →"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Your details are only used to personalise your experience on ApplyGuru.
        </p>
      </div>
    </div>
  );
}
