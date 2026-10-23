"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/lib/user-context";
import { sendEmail } from "@/lib/send-email";
import { trackActivity } from "@/lib/track-activity";

const webinars: Record<string, {
  id: string; emoji: string; title: string; topic: string; speakers: string[];
  date: string; time: string; duration: string; mode: string; price: number;
  seats: number; registered: number; live: boolean; badge: string;
  description: string; gradient: string;
}> = {
  wb1: { id:"wb1", emoji:"🚀", title:"Breaking into Product Management in 2025", topic:"Career", speakers:["Ravi Kumar (Google)","Anita Shah (Meta)"], date:"Feb 8, 2025", time:"7:00 PM IST", duration:"90 min", mode:"Zoom", price:0, seats:5000, registered:3820, live:false, badge:"", gradient:"from-blue-500 to-violet-600", description:"Get an insider's guide to breaking into PM roles at top companies. Our expert speakers will cover the PM interview process, case study frameworks, and how to build the right portfolio." },
  wb2: { id:"wb2", emoji:"🤖", title:"The AI Revolution: What It Means for You", topic:"Technology", speakers:["Dr. Priya Nair"], date:"Feb 10, 2025", time:"6:00 PM IST", duration:"60 min", mode:"YouTube", price:0, seats:10000, registered:8100, live:false, badge:"🔥 Trending", gradient:"from-violet-500 to-purple-600", description:"Understand how AI is reshaping every industry and what you can do to stay ahead. Dr. Priya Nair walks through practical AI tools, career opportunities, and the skills you need." },
  wb3: { id:"wb3", emoji:"💰", title:"Personal Finance & Investment for Millennials", topic:"Finance", speakers:["CA Mohit Gupta"], date:"Feb 12, 2025", time:"8:00 PM IST", duration:"75 min", mode:"Zoom", price:199, seats:500, registered:287, live:false, badge:"", gradient:"from-emerald-500 to-teal-600", description:"Take control of your money. Learn SIPs, mutual funds, tax-saving investments, and how to build a ₹1 crore portfolio starting from just ₹500/month." },
  wb4: { id:"wb4", emoji:"💼", title:"Ace Your Next Job Interview", topic:"Career", speakers:["Kavya Reddy (Deloitte)","Arun S (KPMG)"], date:"Today", time:"Live Now", duration:"60 min", mode:"Zoom", price:0, seats:2000, registered:1650, live:true, badge:"🔴 Live", gradient:"from-red-500 to-rose-600", description:"Live session on cracking interviews at top consulting and tech firms. Real mock interview demonstrations, do's and don'ts, and Q&A with the speakers." },
};

const defaultWebinar = {
  id:"x", emoji:"📡", title:"Webinar Not Found", topic:"General", speakers:[], date:"TBD", time:"TBD",
  duration:"TBD", mode:"Online", price:0, seats:0, registered:0, live:false, badge:"",
  gradient:"from-slate-500 to-slate-600", description:"This webinar could not be found."
};

export default function WebinarDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const { profile } = useUser();
  const w = webinars[params.id] ?? defaultWebinar;
  const fillPct = w.seats > 0 ? Math.min(100, (w.registered / w.seats) * 100) : 0;

  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  const userEmail = session?.user?.email;
  const userName  = session?.user?.name ?? profile.name ?? "Student";

  const handleRegister = async () => {
    if (!userEmail || registered) return;
    setRegistering(true);
    await sendEmail({
      type: "event-registered",
      to: userEmail,
      data: { name: userName.split(" ")[0], eventName: w.title, eventDate: `${w.date} · ${w.time}`, eventMode: `${w.mode} Webinar · ${w.duration}` },
    });
    fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail, incrementStat: "eventsAttended" }) }).catch(() => {});
    trackActivity({ email: userEmail, type: "webinar-registered", itemId: params.id, itemTitle: w.title, itemDetails: `${w.date} · ${w.time} · ${w.mode}` });
    setRegistering(false);
    setRegistered(true);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {registered && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg animate-slide-down">
          <span className="text-lg">🎉</span>
          <div>
            <p className="font-semibold text-sm">You&apos;re registered!</p>
            <p className="text-xs text-emerald-100">Confirmation sent to {userEmail}</p>
          </div>
        </div>
      )}

      <Link href="/webinars" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
        ← Back to Webinars
      </Link>

      <div className={`rounded-2xl bg-gradient-to-br ${w.gradient} p-8 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{w.emoji}</span>
              {w.live && (
                <span className="flex items-center gap-1.5 text-xs font-bold bg-red-500 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />LIVE NOW
                </span>
              )}
              {w.badge && !w.live && <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">{w.badge}</span>}
            </div>
            <span className={`text-sm font-bold px-3 py-1 rounded-xl ${w.price === 0 ? "bg-emerald-500" : "bg-white/20"}`}>
              {w.price === 0 ? "Free" : `₹${w.price}`}
            </span>
          </div>
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-2">{w.topic}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">{w.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
            <span>📅 {w.date}</span>
            <span>🕐 {w.time}</span>
            <span>⏱ {w.duration}</span>
            <span>📺 {w.mode}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold text-[var(--foreground)] mb-3">About this Webinar</h2>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{w.description}</p>
            </CardContent>
          </Card>

          {w.speakers.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-bold text-[var(--foreground)] mb-4">Speakers</h2>
                <div className="space-y-3">
                  {w.speakers.map((speaker, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${w.gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                        {speaker.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{speaker}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--muted-foreground)]">{w.registered.toLocaleString()} registered</span>
                  <span className="font-semibold">{(w.seats - w.registered).toLocaleString()} seats left</span>
                </div>
                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full gradient-brand rounded-full" style={{ width:`${fillPct}%` }} />
                </div>
              </div>

              {!userEmail ? (
                <Button variant="gradient" className="w-full" size="lg" asChild>
                  <Link href={`/login?callbackUrl=/webinars/${params.id}`}>Sign in to Register</Link>
                </Button>
              ) : registered ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-emerald-700 font-semibold text-sm">✅ You&apos;re registered!</p>
                  <p className="text-emerald-600 text-xs mt-1">Confirmation sent to {userEmail}</p>
                </div>
              ) : (
                <Button
                  variant={w.live ? "default" : "gradient"}
                  className={`w-full ${w.live ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
                  size="lg"
                  loading={registering}
                  onClick={handleRegister}
                >
                  {w.live ? "🔴 Join Live Now →" : w.price === 0 ? "Register Free →" : `Register — ₹${w.price} →`}
                </Button>
              )}

              <Button variant="ghost" className="w-full" size="sm" onClick={() => {
                navigator.clipboard.writeText(window.location.href).catch(() => {});
              }}>
                📤 Share
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
