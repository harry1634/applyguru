import { NextRequest, NextResponse } from "next/server";
import { createEvent, getPublishedEvents, getEventsByOrganizer, getEventById, getAllEvents } from "@/lib/event-store";

export async function GET(req: NextRequest) {
  const id        = req.nextUrl.searchParams.get("id");
  const organizer = req.nextUrl.searchParams.get("organizer");
  const all       = req.nextUrl.searchParams.get("all");
  if (id)        return NextResponse.json({ event: await getEventById(id) });
  if (organizer) return NextResponse.json({ events: await getEventsByOrganizer(organizer) });
  if (all)       return NextResponse.json({ events: await getAllEvents() });
  return NextResponse.json({ events: await getPublishedEvents() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.title || !body.organizerEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const event = await createEvent({ ...body, status: body.status ?? "published" });
  return NextResponse.json({ event });
}
