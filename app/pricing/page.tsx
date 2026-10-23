import Link from "next/link";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect for exploring ApplyGuru",
    highlight: false,
    badge: "",
    features: [
      "Browse all events, jobs & workshops",
      "Apply to up to 5 jobs/month",
      "Join 3 webinars/month",
      "1 free counseling session",
      "Basic profile & certificates",
      "Community access",
    ],
    cta: "Get started free",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    desc: "For serious job seekers & students",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Unlimited job applications",
      "Priority job alerts & early access",
      "AI resume builder & review",
      "1 counseling session/month (free)",
      "Exclusive Pro webinars",
      "Certificate verification badge",
      "No ads",
    ],
    cta: "Start Pro — ₹499/mo",
    href: "/signup",
  },
  {
    name: "Pro Annual",
    price: "₹399",
    period: "per month",
    desc: "Save 20% with annual billing",
    highlight: false,
    badge: "Save 20%",
    features: [
      "Everything in Pro",
      "2 free counseling sessions/month",
      "Offline event priority check-in",
      "Resume PDF export",
      "Dedicated support",
    ],
    cta: "Start Annual — ₹4,788/yr",
    href: "/signup",
  },
];

const faqs = [
  { q:"Can I cancel anytime?",                ans:"Yes. Cancel from Settings > Billing at any time. Your Pro access continues until the end of the billing period." },
  { q:"Is there a student discount?",          ans:"Yes! Verify your college email to get 30% off Pro plans. Email us at students@applyguru.in." },
  { q:"What payment methods are accepted?",    ans:"UPI, all major debit/credit cards, net banking, and EMI options via Razorpay." },
  { q:"What's included in the free plan?",     ans:"Full access to browse events, jobs, workshops, and webinars. You can apply to 5 jobs/month and join 3 webinars. No credit card needed." },
  { q:"How does the AI resume builder work?",  ans:"Upload your existing resume or start fresh. Our AI tailors it for specific job roles, optimizes keywords, and checks ATS compatibility." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
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
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, honest pricing</h1>
        <p className="text-xl text-slate-500 max-w-xl mx-auto">Start free. Upgrade when you need more. No hidden fees.</p>
      </section>

      {/* Plans */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-7 flex flex-col relative ${plan.highlight ? "gradient-brand text-white shadow-glow" : "bg-white border border-[var(--border)] shadow-card"}`}>
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full ${plan.highlight ? "bg-white text-violet-700" : "bg-brand-600 text-white"}`}>
                  {plan.badge}
                </span>
              )}
              <div className="mb-6">
                <p className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.price}</span>
                  <span className={`text-sm mb-1.5 ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>/{plan.period}</span>
                </div>
                <p className={`text-sm ${plan.highlight ? "text-blue-100" : "text-slate-500"}`}>{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`text-sm flex items-start gap-2 ${plan.highlight ? "text-white" : "text-slate-600"}`}>
                    <span className={`mt-0.5 ${plan.highlight ? "text-blue-200" : "text-emerald-500"}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlight ? "default" : "gradient"}
                className={`w-full ${plan.highlight ? "bg-white text-violet-700 hover:bg-blue-50 font-bold" : ""}`}
                size="lg"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-[var(--muted)] py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl p-5 border border-[var(--border)]">
                <p className="font-semibold text-slate-900 mb-2">{faq.q}</p>
                <p className="text-sm text-slate-500">{faq.ans}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to supercharge your career?</h2>
        <p className="text-slate-500 mb-8">Join 500,000+ students already using ApplyGuru.</p>
        <Button variant="gradient" size="lg" asChild>
          <Link href="/signup">Get started for free →</Link>
        </Button>
      </section>
    </div>
  );
}
