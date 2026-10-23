"use client";

import { useCompletion } from "ai/react";
import { useState } from "react";
import { Loader2, Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function CoverLetterGenerator() {
  const [jobTitle, setJobTitle]     = useState("");
  const [company, setCompany]       = useState("");
  const [jobDescription, setJobDesc] = useState("");
  const [copied, setCopied]         = useState(false);

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/cover-letter",
    onError: () => toast.error("Failed to generate. Please try again."),
  });

  const handleGenerate = async () => {
    if (!jobTitle || !company || !jobDescription) {
      toast.error("Please fill in job title, company, and description.");
      return;
    }
    await complete("", {
      body: { jobTitle, company, jobDescription },
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const inputClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Job Details</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Job Title *</label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Senior Frontend Engineer"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Company *</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Stripe"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Job Description *</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the full job description here…"
            rows={10}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isLoading ? "Generating…" : "Generate Cover Letter"}
        </button>
      </div>

      {/* Output */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Your Cover Letter</h2>
          {completion && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>

        {!completion && !isLoading && (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              Your cover letter will appear here…
            </p>
          </div>
        )}

        {(completion || isLoading) && (
          <div className="prose-app min-h-64 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {completion}
            {isLoading && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
