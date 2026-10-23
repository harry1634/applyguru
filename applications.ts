"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ApplicationStatus } from "@/types";

const applicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.enum([
    "wishlist", "applied", "screening", "interview",
    "offer", "rejected", "withdrawn", "ghosted",
  ]).default("applied"),
  location: z.string().optional().nullable(),
  work_mode: z.enum(["remote", "hybrid", "onsite"]).optional().nullable(),
  salary_min: z.number().optional().nullable(),
  salary_max: z.number().optional().nullable(),
  salary_currency: z.string().default("USD"),
  job_url: z.string().url().optional().nullable().or(z.literal("")),
  job_description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  applied_at: z.string().optional().nullable(),
  deadline_at: z.string().optional().nullable(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function createApplication(formData: ApplicationFormData) {
  const parsed = applicationSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { supabase, user } = await getAuthUser();

  const { data, error } = await supabase
    .from("applications")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { data };
}

export async function updateApplication(
  id: string,
  formData: Partial<ApplicationFormData>
) {
  const { supabase, user } = await getAuthUser();

  const { data, error } = await supabase
    .from("applications")
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  return { data };
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return updateApplication(id, { status });
}

export async function deleteApplication(id: string) {
  const { supabase, user } = await getAuthUser();

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { success: true };
}
