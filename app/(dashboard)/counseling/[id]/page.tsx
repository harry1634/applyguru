"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

const counselors: Record<string, {
  id: string; name: string; role: string; company: string; rating: number;
  sessions: number; price: number; badge: string; gradient: string;
  specializations: string[]; available: string[]; bio: string; reviews: { name: string; rating: number; text: string }[];
}> = {
  c1: { id:"c1", name:"Priya Sharma", role:"Senior Product Manager", company:"ex-Google, Microsoft", rating:4.9, sessions:420, price:599, badge:"Top Rated", gradient:"from-violet-400 to-purple-500", specializations:["Career Switch","Resume Review","Mock Interview"], available:["Today 4:00 PM","Tomorrow 10:00 AM","Tomorrow 2:00 PM","Feb 5 11:00 AM"], bio:"8+ years in product management at Google and Microsoft. I've helped 400+ professionals land PM roles at top companies. My sessions are practical, structured, and tailored to your specific goal — whether it's cracking PM interviews or making a career pivot.", reviews:[{ name:"Aryan M.", rating:5, text:"Priya's mock interview was incredibly realistic. I landed a PM role at a Series B startup within 3 weeks!" },{ name:"Sneha K.", rating:5, text:"She reviewed my resume and LinkedIn — the feedback was detailed and actionable. Highly recommend." },{ name:"Rahul V.", rating:4, text:"Great session on career planning. Very structured and insightful." }] },
  c2: { id:"c2", name:"Arjun Kapoor", role:"IITian | IIM Alumni", company:"McKinsey & Co", rating:4.8, sessions:280, price:999, badge:"Premium", gradient:"from-blue-400 to-indigo-500", specializations:["MBA","Career Switch","Salary Negotiation"], available:["Tomorrow 11:00 AM","Feb 3 4:00 PM","Feb 4 2:00 PM"], bio:"IIT Bombay grad, IIM Ahmedabad MBA, now a consultant at McKinsey. I help students get into top B-schools and professionals negotiate better salaries. My approach is data-driven and results-focused.", reviews:[{ name:"Divya P.", rating:5, text:"Arjun helped me craft my MBA application story. Got into IIM-A!" },{ name:"Karthik S.", rating:5, text:"Best salary negotiation advice I've gotten. Used his framework and got 40% more." }] },
};

const defaultCounselor = {
  id:"x", name:"Counselor Not Found", role:"", company:"", rating:0, sessions:0,
  price:0, badge:"", gradient:"from-slate-400 to-slate-500", specializations:[],
  available:[], bio:"", reviews:[]
};

export default function CounselorDetailPage({ params }: { params: { id: string } }) {
  const c = counselors[params.id] ?? defaultCounselor;
  const [selectedSlot, setSelectedSlot] = useState("");
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    if (!selectedSlot) return;
    setBooked(true);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Link href="/counseling" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
        ← Back to Counselors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Profile card */}
          <Card className="overflow-hidden">
            <div className={`h-24 bg-gradient-to-r ${c.gradient}`} />
            <CardContent className="p-5 pt-0">
              <div className="-mt-8 mb-4">
                <Avatar name={c.name} gradient={c.gradient} size="xl" className="ring-4 ring-[var(--card)]" />
              </div>
              {c.badge && (
                <span className="inline-block text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-2">{c.badge}</span>
              )}
              <h1 className="text-xl font-bold text-[var(--foreground)]">{c.name}</h1>
              <p className="text-sm text-[var(--primary)] font-medium">{c.role}</p>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">{c.company}</p>

              <div className="flex items-center gap-6 mb-4">
                <div><p className="text-lg font-bold text-amber-500">★ {c.rating}</p><p className="text-xs text-[var(--muted-foreground)]">Rating</p></div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <div><p className="text-lg font-bold text-[var(--foreground)]">{c.sessions}+</p><p className="text-xs text-[var(--muted-foreground)]">Sessions</p></div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <div><p className="text-lg font-bold text-[var(--foreground)]">₹{c.price}</p><p className="text-xs text-[var(--muted-foreground)]">per session</p></div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {c.specializations.map((s) => (
                  <Badge key={s} variant="subtle" size="sm">{s}</Badge>
                ))}
              </div>

              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{c.bio}</p>
            </CardContent>
          </Card>

          {/* Reviews */}
          {c.reviews.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-bold text-[var(--foreground)] mb-4">Student Reviews</h2>
                <div className="space-y-4">
                  {c.reviews.map((r, i) => (
                    <div key={i} className="pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[var(--foreground)]">{r.name}</span>
                        <span className="text-amber-500 text-xs">{"★".repeat(r.rating)}</span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">{r.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking card */}
        <div>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--foreground)]">₹{c.price}</p>
                <p className="text-xs text-[var(--muted-foreground)]">per 60-min session</p>
              </div>

              {!booked ? (
                <>
                  <div>
                    <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Select a time slot:</p>
                    <div className="space-y-2">
                      {c.available.map((slot) => (
                        <button key={slot} onClick={() => setSelectedSlot(slot)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                            selectedSlot === slot
                              ? "border-[var(--primary)] bg-brand-50 text-[var(--primary)]"
                              : "border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)]"
                          }`}>
                          📅 {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button variant="gradient" className="w-full" size="lg"
                    onClick={handleBook} disabled={!selectedSlot}>
                    Book Session →
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="font-bold text-[var(--foreground)]">Session Booked!</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">{selectedSlot}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">You&apos;ll receive a confirmation email shortly.</p>
                </div>
              )}

              <div className="text-xs text-[var(--muted-foreground)] space-y-1 pt-2 border-t border-[var(--border)]">
                <p>✓ Secure payment via Razorpay</p>
                <p>✓ Full refund if cancelled 24h before</p>
                <p>✓ Session recording shared after</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
