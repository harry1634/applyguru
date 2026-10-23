import { NextRequest, NextResponse } from "next/server";
import { createJob, getPublishedJobs, getJobsByOrganizer, getJobById, getAllJobs, updateJobStatus } from "@/lib/job-store";

export async function GET(req: NextRequest) {
  const id        = req.nextUrl.searchParams.get("id");
  const organizer = req.nextUrl.searchParams.get("organizer");
  const all       = req.nextUrl.searchParams.get("all");
  if (id)        return NextResponse.json({ job: await getJobById(id) });
  if (organizer) return NextResponse.json({ jobs: await getJobsByOrganizer(organizer) });
  if (all)       return NextResponse.json({ jobs: await getAllJobs() });
  return NextResponse.json({ jobs: await getPublishedJobs() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.title || !body.organizerEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const job = await createJob({ ...body, status: body.status ?? "published" });
  return NextResponse.json({ job });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  const job = await updateJobStatus(id, status);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  return NextResponse.json({ job });
}
