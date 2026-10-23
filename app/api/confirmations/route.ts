import { NextRequest, NextResponse } from "next/server";
import { setConfirmation, removeConfirmation, getConfirmationsByEvent, getAllConfirmations } from "@/lib/confirmation-store";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (eventId) return NextResponse.json({ confirmations: await getConfirmationsByEvent(eventId) });
  return NextResponse.json({ confirmations: await getAllConfirmations() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { activityId, eventId, participantEmail, status } = body;
  if (!activityId || !eventId || !participantEmail || !status)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const confirmation = await setConfirmation(activityId, eventId, participantEmail, status);
  return NextResponse.json({ confirmation });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  if (!body.activityId) return NextResponse.json({ error: "Missing activityId" }, { status: 400 });
  await removeConfirmation(body.activityId);
  return NextResponse.json({ success: true });
}
