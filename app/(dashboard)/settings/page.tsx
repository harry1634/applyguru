"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/user-context";

const tabs = ["Profile", "Notifications", "Privacy", "Security", "Billing"];

interface NotifSettings { newEvents: boolean; applications: boolean; reminders: boolean; webinars: boolean; jobs: boolean; digest: boolean; marketing: boolean; }
interface PrivacySettings { publicProfile: boolean; showCerts: boolean; showActivity: boolean; allowConnections: boolean; searchByEmail: boolean; }

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg animate-slide-down">
      <span>✅</span><span className="font-semibold text-sm">{message}</span>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${checked ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { profile, updateProfile, syncFromAPI } = useUser();
  const { data: session } = useSession();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("Profile");
  const [toast, setToast]         = useState("");
  const [draft, setDraft]         = useState({ ...profile });

  // Sync real user data from API on mount, then apply to draft
  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    syncFromAPI(email);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  // Whenever profile context updates (from API sync), refresh the draft
  useEffect(() => {
    setDraft((d) => ({ ...profile, ...d, email: profile.email || d.email }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.name, profile.email, profile.avatar]);

  const [notif, setNotif] = useState<NotifSettings>({
    newEvents: true, applications: true, reminders: true,
    webinars: false, jobs: true, digest: false, marketing: false,
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    publicProfile: true, showCerts: true, showActivity: false,
    allowConnections: true, searchByEmail: false,
  });

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError]     = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSaveProfile = async () => {
    updateProfile(draft);
    fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: draft.email, name: draft.name, phone: draft.phone, college: draft.college }),
    }).catch(() => {});
    showToast("Profile saved successfully!");
  };

  const handleSavePrefs = () => showToast("Preferences saved!");

  const handlePwSave = () => {
    setPwError("");
    if (!currentPw)       { setPwError("Enter your current password."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    showToast("Password updated!");
  };

  const set = (k: keyof typeof draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  const initials = (draft.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Photo must be under 2MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setDraft((d) => ({ ...d, avatar: dataUrl }));
      updateProfile({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {toast && <Toast message={toast} />}

      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-0.5">Manage your account preferences</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] -mb-px">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${
              activeTab === tab
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {activeTab === "Profile" && (
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Profile Photo</CardTitle></CardHeader>
            <CardContent className="pt-0 flex items-center gap-5">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <div className="relative shrink-0 group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                {draft.avatar ? (
                  <img src={draft.avatar} alt="Profile" className="h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded-2xl gradient-brand flex items-center justify-center text-3xl font-bold text-white">{initials}</div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                  {draft.avatar ? "Change photo" : "Upload photo"}
                </Button>
                {draft.avatar && (
                  <button className="block text-xs text-red-500 hover:underline" onClick={() => { setDraft((d) => ({ ...d, avatar: undefined })); updateProfile({ avatar: undefined }); }}>
                    Remove photo
                  </button>
                )}
                <p className="text-xs text-[var(--muted-foreground)]">JPG, PNG or GIF · Max 2MB</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full name"  value={draft.name}     onChange={set("name")}     placeholder="Your full name" />
                <Input label="Username"   value={draft.username} onChange={set("username")} placeholder="your_username" />
              </div>
              <Input label="Email address" type="email" value={draft.email} onChange={set("email")} placeholder="you@example.com" />
              <Input label="Phone number"  type="tel"   value={draft.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Bio</label>
                <textarea rows={3} value={draft.bio} onChange={set("bio")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="College / University" value={draft.college}        onChange={set("college")} />
                <Input label="Graduation year"       value={draft.batch}          onChange={set("batch")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Location</CardTitle></CardHeader>
            <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="City"  value={draft.city}  onChange={set("city")} />
              <Input label="State" value={draft.state} onChange={set("state")} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="gradient" onClick={handleSaveProfile}>Save changes</Button>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === "Notifications" && (
        <Card>
          <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
          <CardContent className="pt-0">
            {([
              ["newEvents",    "New events matching your interests",   "Get notified when new events are posted"],
              ["applications", "Application status updates",            "Know when your application status changes"],
              ["reminders",    "Event reminders",                       "Reminder 24h before registered events"],
              ["webinars",     "Webinar alerts",                        "Live webinar start notifications"],
              ["jobs",         "Job alerts",                            "New jobs matching your skills"],
              ["digest",       "Weekly digest",                         "Summary of top opportunities each week"],
              ["marketing",    "Marketing & promotions",                "Offers, discounts and feature updates"],
            ] as [keyof NotifSettings, string, string][]).map(([key, label, sub]) => (
              <div key={key} className="flex items-center gap-4 py-4 border-b border-[var(--border)] last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{sub}</p>
                </div>
                <Toggle checked={notif[key]} onChange={() => setNotif((n) => ({ ...n, [key]: !n[key] }))} />
              </div>
            ))}
            <div className="pt-4"><Button variant="gradient" onClick={handleSavePrefs}>Save preferences</Button></div>
          </CardContent>
        </Card>
      )}

      {/* ── PRIVACY ── */}
      {activeTab === "Privacy" && (
        <Card>
          <CardHeader><CardTitle>Privacy Settings</CardTitle></CardHeader>
          <CardContent className="pt-0">
            {([
              ["publicProfile",    "Public profile",            "Anyone can view your profile"],
              ["showCerts",        "Show certificates",         "Display earned certificates on your profile"],
              ["showActivity",     "Show activity",             "Let others see events you attended"],
              ["allowConnections", "Allow connection requests", "Let other users send you connection requests"],
              ["searchByEmail",    "Searchable by email",       "Let others find you using your email"],
            ] as [keyof PrivacySettings, string, string][]).map(([key, label, sub]) => (
              <div key={key} className="flex items-center gap-4 py-4 border-b border-[var(--border)] last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{sub}</p>
                </div>
                <Toggle checked={privacy[key]} onChange={() => setPrivacy((p) => ({ ...p, [key]: !p[key] }))} />
              </div>
            ))}
            <div className="pt-4"><Button variant="gradient" onClick={handleSavePrefs}>Save preferences</Button></div>
          </CardContent>
        </Card>
      )}

      {/* ── SECURITY ── */}
      {activeTab === "Security" && (
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              {pwError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">⚠️ {pwError}</div>
              )}
              <Input label="Current password" type="password" placeholder="••••••••" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
              <Input label="New password"     type="password" placeholder="At least 8 characters" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              <Input label="Confirm password" type="password" placeholder="••••••••" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
              <Button variant="gradient" onClick={handlePwSave}>Update password</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
            <CardContent className="pt-0 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--foreground)]">Protect your account with 2FA</p>
                <p className="text-xs text-[var(--muted-foreground)]">Currently disabled</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => showToast("2FA setup coming soon!")}>Enable 2FA</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── BILLING ── */}
      {activeTab === "Billing" && (
        <div className="space-y-5">
          {showUpgrade ? (
            <Card>
              <CardHeader><CardTitle>Upgrade to Pro — ₹499/month</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Name on card" placeholder="Riya Sharma" />
                  <Input label="Card number"  placeholder="1234 5678 9012 3456" />
                  <Input label="Expiry date"  placeholder="MM / YY" />
                  <Input label="CVV"          placeholder="•••" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowUpgrade(false)}>Cancel</Button>
                  <Button variant="gradient" className="flex-1" onClick={() => { setShowUpgrade(false); showToast("Payment successful! Welcome to Pro 🎉"); }}>
                    Pay ₹499 →
                  </Button>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] text-center">🔒 Secured by Razorpay · Cancel anytime</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="rounded-2xl gradient-brand p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-200 mb-1">Current Plan</p>
                <p className="text-2xl font-bold mb-1">Free</p>
                <p className="text-blue-100 text-sm mb-4">Access to basic features and opportunities</p>
                <Button className="bg-white text-violet-700 hover:bg-blue-50 font-bold" size="sm"
                  onClick={() => setShowUpgrade(true)}>
                  Upgrade to Pro →
                </Button>
              </div>
              <Card>
                <CardHeader><CardTitle>Pro Plan — ₹499/month</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {["Unlimited applications", "Priority job alerts", "AI resume builder", "1 free counseling session/month", "Exclusive Pro webinars", "Certificate verification badge"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                      <span className="text-emerald-500 font-bold">✓</span> {f}
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button variant="gradient" onClick={() => setShowUpgrade(true)}>Upgrade to Pro</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
