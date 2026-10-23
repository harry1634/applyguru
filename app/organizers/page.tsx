import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  { icon:"📣", title:"Reach 500K+ Students",          desc:"Instant access to verified students and professionals from 500+ colleges across India." },
  { icon:"🎯", title:"Smart Targeting",               desc:"Filter attendees by college, course, year, city, and interest for better event quality." },
  { icon:"📊", title:"Real-time Analytics",           desc:"Live registration counts, attendee demographics, and post-event feedback reports." },
  { icon:"✅", title:"Easy Registration Management", desc:"QR code check-in, waitlist management, and automated confirmation emails." },
  { icon:"💳", title:"Built-in Payments",             desc:"Collect registration fees securely via Razorpay. Instant payouts to your account." },
  { icon:"📜", title:"Bulk Certificates",             desc:"Generate and send verified digital certificates to all attendees in one click." },
];

const pricing = [
  { name:"Starter",    price:"Free",    events:"3 events/month", highlight:false, features:["Up to 100 attendees","Basic analytics","Email notifications","QR check-in"] },
  { name:"Growth",     price:"₹2,999",  events:"15 events/month",highlight:true,  features:["Up to 2,000 attendees","Advanced analytics","Custom emails","Certificates","Priority support"] },
  { name:"Enterprise", price:"Custom",  events:"Unlimited",      highlight:false, features:["Unlimited attendees","Dedicated account manager","API access","Custom branding","SLA guarantee"] },
];

export default function OrganizersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar simple */}
      <header className="h-16 border-b border-[var(--border)] flex items-center px-6 justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 gradient-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AG</span>
          </div>
          <span className="font-bold text-lg"><span className="gradient-text">Apply</span>Guru</span>
        </Link>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" asChild><Link href="/login">Log in</Link></Button>
          <Button variant="gradient" size="sm" asChild><Link href="/signup">Get started free</Link></Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          🏢 For Organizers & Companies
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
          Post events, find talent,<br /><span className="gradient-text">grow your community</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          India&apos;s most trusted platform for posting events, workshops, webinars, and job openings to 500K+ verified students and professionals.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="gradient" size="lg" asChild>
            <Link href="/signup">Start for free →</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/login">View demo</Link>
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-4">No credit card required · 3 free events/month</p>
      </section>

      {/* Stats */}
      <section className="bg-[var(--muted)] py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[["500K+","Verified Users"],["63K+","Events Hosted"],["4.9★","Organizer Rating"],["₹0","Setup Cost"]].map(([val,label]) => (
            <div key={label}>
              <p className="text-3xl font-bold gradient-text">{val}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Everything you need to run great events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-[var(--border)] bg-white hover-lift shadow-card">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[var(--muted)] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">Simple, transparent pricing</h2>
          <p className="text-slate-500 text-center mb-12">Start free. Scale as you grow.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 ${plan.highlight ? "gradient-brand text-white shadow-glow" : "bg-white border border-[var(--border)]"}`}>
                <p className={`text-sm font-semibold mb-1 ${plan.highlight ? "text-blue-100" : "text-slate-400"}`}>{plan.name}</p>
                <p className={`text-3xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.price}</p>
                <p className={`text-xs mb-6 ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>{plan.events}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${plan.highlight ? "text-white" : "text-slate-600"}`}>
                      <span className={plan.highlight ? "text-white" : "text-emerald-500"}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.highlight ? "bg-white text-violet-700 hover:bg-blue-50 font-bold" : ""}`}
                  variant={plan.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href="/signup">Get started</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to reach 500K+ students?</h2>
        <p className="text-slate-500 mb-8">Join 2,000+ organizers who trust ApplyGuru to run their events.</p>
        <Button variant="gradient" size="lg" asChild>
          <Link href="/signup">Create your first event free →</Link>
        </Button>
      </section>
    </div>
  );
}
