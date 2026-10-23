import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Sparkles, BarChart3, BrainCircuit, FileText, Users } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Visual Kanban Tracker",
    description:
      "Drag-and-drop your applications through every stage — Applied, Screening, Interview, Offer, and beyond.",
  },
  {
    icon: BrainCircuit,
    title: "AI Resume Optimizer",
    description:
      "Instantly tailor your resume to any job description with AI-powered keyword matching and gap analysis.",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description:
      "Generate compelling, personalized cover letters in seconds using the job description and your background.",
  },
  {
    icon: Users,
    title: "Network & Contacts CRM",
    description:
      "Track referrals, follow-ups, and relationships so no opportunity slips through the cracks.",
  },
  {
    icon: Sparkles,
    title: "Interview Coach",
    description:
      "Practice with AI-generated questions tailored to your role, and get instant feedback on your answers.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Understand your funnel — response rates, time-to-offer, and which strategies actually work.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="section relative overflow-hidden">
        {/* Background gradient blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-500/20 via-brand-400/10 to-transparent blur-3xl" />
        </div>

        <div className="page-container flex flex-col items-center gap-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered job search, finally
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Land your dream job{" "}
            <span className="gradient-text">faster than ever</span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            ApplyGuru tracks every application, optimizes your resume with AI,
            generates cover letters instantly, and coaches you through
            interviews — all in one place.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 hover:shadow-glow-sm"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-7 py-3 text-base font-semibold text-foreground transition-colors hover:bg-accent"
            >
              View pricing
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            Free forever plan · No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-muted/30">
        <div className="page-container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything you need to get hired
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Stop juggling spreadsheets, docs, and calendars. ApplyGuru brings
              your entire job search into one intelligent workspace.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card-hover rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="page-container">
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-12 text-center text-white shadow-soft-xl">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to get organized?
            </h2>
            <p className="mb-8 text-brand-100">
              Join thousands of job seekers who land offers faster with
              ApplyGuru.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-base font-semibold text-brand-700 shadow transition-all hover:bg-brand-50"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
