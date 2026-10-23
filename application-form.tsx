"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createApplication, updateApplication, type ApplicationFormData } from "@/server/actions/applications";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Application } from "@/types";
import { KANBAN_COLUMNS, APPLICATION_STATUS_LABELS } from "@/types";

const schema = z.object({
  company:         z.string().min(1, "Company is required"),
  role:            z.string().min(1, "Role is required"),
  status:          z.enum(["wishlist","applied","screening","interview","offer","rejected","withdrawn","ghosted"]).default("applied"),
  location:        z.string().optional().nullable(),
  work_mode:       z.enum(["remote","hybrid","onsite"]).optional().nullable(),
  salary_min:      z.coerce.number().optional().nullable(),
  salary_max:      z.coerce.number().optional().nullable(),
  salary_currency: z.string().default("USD"),
  job_url:         z.string().url("Enter a valid URL").optional().nullable().or(z.literal("")),
  job_description: z.string().optional().nullable(),
  notes:           z.string().optional().nullable(),
  applied_at:      z.string().optional().nullable(),
  deadline_at:     z.string().optional().nullable(),
});

interface ApplicationFormProps {
  application?: Application;
}

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
const textareaClass =
  "flex min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "block text-sm font-medium mb-1.5";
const errorClass = "mt-1 text-xs text-destructive";
const selectClass = `${inputClass} cursor-pointer`;

export function ApplicationForm({ application }: ApplicationFormProps) {
  const router = useRouter();
  const isEditing = !!application;

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ApplicationFormData>({
      resolver: zodResolver(schema),
      defaultValues: application ?? { status: "applied", salary_currency: "USD" },
    });

  const onSubmit = async (data: ApplicationFormData) => {
    const result = isEditing
      ? await updateApplication(application.id, data)
      : await createApplication(data);

    if (result?.error) {
      toast.error("Failed to save application");
    } else {
      toast.success(isEditing ? "Application updated" : "Application added");
      router.push("/applications");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Job Details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Company *</label>
            <input {...register("company")} placeholder="Google" className={inputClass} />
            {errors.company && <p className={errorClass}>{errors.company.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Role *</label>
            <input {...register("role")} placeholder="Software Engineer" className={inputClass} />
            {errors.role && <p className={errorClass}>{errors.role.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Status</label>
            <select {...register("status")} className={selectClass}>
              {KANBAN_COLUMNS.map((s) => (
                <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Work Mode</label>
            <select {...register("work_mode")} className={selectClass}>
              <option value="">Not specified</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input {...register("location")} placeholder="San Francisco, CA" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Job Posting URL</label>
          <input {...register("job_url")} placeholder="https://…" type="url" className={inputClass} />
          {errors.job_url && <p className={errorClass}>{errors.job_url.message}</p>}
        </div>
      </div>

      {/* Dates */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Dates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Applied on</label>
            <input {...register("applied_at")} type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Deadline</label>
            <input {...register("deadline_at")} type="date" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Salary */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Compensation</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Currency</label>
            <select {...register("salary_currency")} className={selectClass}>
              {["USD","EUR","GBP","INR","CAD","AUD"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Min salary</label>
            <input {...register("salary_min")} type="number" placeholder="80000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Max salary</label>
            <input {...register("salary_max")} type="number" placeholder="120000" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Notes & Job Description</h2>
        <div>
          <label className={labelClass}>Job Description</label>
          <textarea {...register("job_description")} placeholder="Paste the full job description for AI analysis…" className={textareaClass} rows={6} />
        </div>
        <div>
          <label className={labelClass}>Personal Notes</label>
          <textarea {...register("notes")} placeholder="Recruiter name, interview tips, etc." className={textareaClass} rows={3} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Save changes" : "Add application"}
        </button>
      </div>
    </form>
  );
}
