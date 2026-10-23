import { NextRequest, NextResponse } from "next/server";
import { addActivity, getActivitiesByEmail, getAllActivities, getUserActivitySummary, removeActivity } from "@/lib/activity-store";

export async function GET(req: NextRequest) {
  const email   = req.nextUrl.searchParams.get("email");
  const summary = req.nextUrl.searchParams.get("summary");
  const itemId  = req.nextUrl.searchParams.get("itemId");
  if (email && summary) return NextResponse.json(await getUserActivitySummary(email));
  if (email)            return NextResponse.json({ activities: await getActivitiesByEmail(email) });
  if (itemId) {
    const all = await getAllActivities();
    return NextResponse.json({ activities: all.filter((a) => a.itemId === itemId) });
  }
  return NextResponse.json({ activities: await getAllActivities() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.email || !body.type || !body.itemTitle)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const activity = await addActivity(body);
  return NextResponse.json({ activity });
}

export async function DELETE(req: NextRequest) {
  const id    = req.nextUrl.searchParams.get("id");
  const email = req.nextUrl.searchParams.get("email");
  if (!id || !email)
    return NextResponse.json({ error: "Missing id or email" }, { status: 400 });
  const removed = await removeActivity(id, email);
  if (!removed)
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
