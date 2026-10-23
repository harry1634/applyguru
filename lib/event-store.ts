import fs from "fs";
import path from "path";

export interface StoredEvent {
  id: string;
  organizerEmail: string;
  organizerName: string;
  title: string;
  type: string;
  category: string;
  mode: "Online" | "Offline" | "Hybrid";
  date: string;
  time: string;
  endTime: string;
  location: string;
  meetLink: string;
  description: string;
  capacity: string;
  fee: string;
  tags: string;
  registrationDeadline: string;
  status: "published" | "draft";
  createdAt: string;
}

const FILE      = path.join(process.cwd(), "data", "events.json");
const REDIS_KEY = "applyguru:events";

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const { Redis } = require("@upstash/redis");
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

async function read(): Promise<{ events: StoredEvent[] }> {
  const redis = getRedis();
  if (redis) {
    const data = (await redis.get(REDIS_KEY)) as { events: StoredEvent[] } | null;
    return data ?? { events: [] };
  }
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return { events: [] }; }
}

async function write(data: { events: StoredEvent[] }): Promise<void> {
  const redis = getRedis();
  if (redis) { await redis.set(REDIS_KEY, data); return; }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function createEvent(event: Omit<StoredEvent, "id" | "createdAt">): Promise<StoredEvent> {
  const store = await read();
  const entry: StoredEvent = { ...event, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  store.events.push(entry);
  await write(store);
  return entry;
}

export async function getPublishedEvents(): Promise<StoredEvent[]> {
  return (await read()).events
    .filter((e) => e.status === "published")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllEvents(): Promise<StoredEvent[]> {
  return (await read()).events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getEventById(id: string): Promise<StoredEvent | null> {
  return (await read()).events.find((e) => e.id === id) ?? null;
}

export async function getEventsByOrganizer(email: string): Promise<StoredEvent[]> {
  return (await read()).events
    .filter((e) => e.organizerEmail === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
