"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/lib/user-context";
import { sendEmail } from "@/lib/send-email";
import { trackActivity } from "@/lib/track-activity";

const workshops: Record<string, {
  id: string; emoji: string; title: string; instructor: string; org: string;
  duration: string; level: string; mode: string; price: number; rating: number;
  reviews: number; seats: number; tags: string[]; gradient: string; badge: string;
  description: string; curriculum: string[];
}> = {
  w1: { id:"w1", emoji:"🤖", title:"AI & Machine Learning Bootcamp", instructor:"Dr. Amit Kumar", org:"IIT Bombay Online", duration:"30 days", level:"Intermediate", mode:"Online", price:4999, rating:4.9, reviews:820, seats:50, tags:["AI","ML","Python","Deep Learning"], gradient:"from-purple-600 to-blue-600", badge:"🔥 Bestseller", description:"A comprehensive 30-day bootcamp covering machine learning fundamentals to advanced deep learning. Includes hands-on projects, live sessions, and a capstone project.", curriculum:["Week 1: Python & NumPy refresher, Intro to ML", "Week 2: Supervised learning — regression & classification", "Week 3: Neural networks & deep learning with PyTorch", "Week 4: NLP, computer vision & capstone project", "Bonus: Deployment on cloud (AWS/GCP)"] },
  w2: { id:"w2", emoji:"🎨", title:"UI/UX Design Fundamentals", instructor:"Neha Joshi", org:"Designo Labs", duration:"14 days", level:"Beginner", mode:"Online", price:1499, rating:4.8, reviews:430, seats:30, tags:["Figma","UI/UX","Prototyping"], gradient:"from-pink-500 to-rose-600", badge:"New", description:"Learn to design beautiful, user-centered digital products using Figma. From wireframes to high-fidelity prototypes — this course covers it all.", curriculum:["Day 1-3: Design thinking & user research", "Day 4-6: Wireframing & information architecture", "Day 7-10: Visual design & Figma deep dive", "Day 11-14: Prototyping, testing & portfolio project"] },
  w3: { id:"w3", emoji:"💻", title:"Full-Stack Next.js Development", instructor:"Rohan Mehta", org:"TechMentor", duration:"21 days", level:"Intermediate", mode:"Online", price:2999, rating:4.9, reviews:1200, seats:100, tags:["Next.js","React","Node.js","Supabase"], gradient:"from-emerald-500 to-teal-600", badge:"🔥 Bestseller", description:"Build production-ready full-stack apps with Next.js 14, Supabase, and Tailwind CSS. Deploy to Vercel and land your first dev job.", curriculum:["Week 1: React deep dive, Next.js App Router", "Week 2: Supabase auth, database & storage", "Week 3: Payments with Stripe, deployment & CI/CD", "Bonus: Interview prep & portfolio review"] },
};

const defaultWorkshop = {
  id:"x", emoji:"📚", title:"Workshop Not Found", instructor:"TBD", org:"TBD",
  duration:"TBD", level:"All", mode:"Online", price:0, rating:0, reviews:0, seats:0,
  tags:[], gradient:"from-slate-500 to-slate-600", badge:"", description:"Workshop not found.", curriculum:[]
};

export default function WorkshopDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const { profile } = useUser();
  const w = workshops[params.id] ?? defaultWorkshop;

  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const userEmail = session?.user?.email;
  const userName  = session?.user?.name ?? profile.name ?? "Student";

  const handleEnroll = async () => {
    if (!userEmail || enrolled) return;
    setEnrolling(true);
    await sendEmail({
      type: "event-registered",
      to: userEmail,
      data: { name: userName.split(" ")[0], eventName: w.title, eventDate: `${w.duration} · Starts immediately`, eventMode: `${w.mode} Workshop · ${w.level}` },
    });
    fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail, incrementStat: "eventsAttended" }) }).catch(() => {});
    trackActivity({ email: userEmail, type: "workshop-enrolled", itemId: w.id, itemTitle: w.title, itemDetails: `${w.duration} · ${w.mode} · ${w.level}` });
    setEnrolling(false);
    setEnrolled(true);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {enrolled && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg animate-slide-down">
          <span className="text-lg">🎉</span>
          <div>
            <p className="font-semibold text-sm">Enrolled successfully!</p>
            <p className="text-xs text-emerald-100">Confirmation sent to {userEmail}</p>
          </div>
        </div>
      )}

      <Link href="/workshops" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
        ← Back to Workshops
      </Link>

      <div className={`rounded-2xl bg-gradient-to-br ${w.gradient} p-8 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <span className="text-5xl">{w.emoji}</span>
            {w.badge && <span className="text-xs font-bold bg-white/90 text-slate-800 px-3 py-1 rounded-full">{w.badge}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{w.title}</h1>
          <p className="text-white/80 mb-4">by {w.instructor} · {w.org}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
            <span>⏱ {w.duration}</span>
            <span>📶 {w.level}</span>
            <span>🌐 {w.mode}</span>
            <span>★ {w.rating} ({w.reviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold text-[var(--foreground)] mb-3">About this Workshop</h2>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{w.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {w.tags.map((t) => (
                  <span key={t} className="text-xs bg-[var(--muted)] text-[var(--foreground)] px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {w.curriculum.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-bold text-[var(--foreground)] mb-4">Curriculum</h2>
                <div className="space-y-3">
                  {w.curriculum.map((item, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className={`h-6 w-6 rounded-full bg-gradient-to-br ${w.gradient} text-white flex items-center justify-center text-xs font-bold shrink-0`}>{i + 1}</span>
                      <p className="text-[var(--foreground)] pt-0.5">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {w.price === 0 ? "Free" : `₹${w.price.toLocaleString("en-IN")}`}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">{w.seats} seats remaining</p>
              </div>

              {!userEmail ? (
                <Button variant="gradient" className="w-full" size="lg" asChild>
                  <Link href={`/login?callbackUrl=/workshops/${params.id}`}>Sign in to Enroll</Link>
                </Button>
              ) : enrolled ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-emerald-700 font-semibold text-sm">✅ Enrolled!</p>
                  <p className="text-emerald-600 text-xs mt-1">Confirmation sent to {userEmail}</p>
                </div>
              ) : (
                <Button variant="gradient" className="w-full" size="lg" loading={enrolling} onClick={handleEnroll}>
                  {w.price === 0 ? "Enroll Free →" : "Enroll Now →"}
                </Button>
              )}

              <Button
                variant="outline"
                className={`w-full ${wishlisted ? "text-brand-600 border-brand-300 bg-brand-50" : ""}`}
                size="sm"
                onClick={() => setWishlisted((s) => !s)}
              >
                {wishlisted ? "🔖 Wishlisted!" : "🔖 Add to Wishlist"}
              </Button>
              <div className="text-xs text-[var(--muted-foreground)] space-y-1.5 pt-2 border-t border-[var(--border)]">
                <p>✓ Certificate of completion</p>
                <p>✓ Lifetime access to recordings</p>
                <p>✓ Community Discord access</p>
                <p>✓ 30-day money-back guarantee</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
