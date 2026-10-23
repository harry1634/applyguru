import fs from "fs";
import path from "path";

export interface Confirmation {
  id: string;
  activityId: string;       // the activity.id of the registration
  eventId: string;
  participantEmail: string;
  status: "confirmed" | "rejected";
  confirmedAt: string;
}

const FILE      = path.join(process.cwd(), "data", "confirmations.json");
const REDIS_KEY = "applyguru:confirmations";

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const { Redis } = require("@upstash/redis");
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

async function read(): Promise<{ confirmations: Confirmation[] }> {
  const redis = getRedis();
  if (redis) {
    const data = (await redis.get(REDIS_KEY)) as { confirmations: Confirmation[] } | null;
    return data ?? { confirmations: [] };
  }
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return { confirmations: [] }; }
}

async function write(data: { confirmations: Confirmation[] }): Promise<void> {
  const redis = getRedis();
  if (redis) { await redis.set(REDIS_KEY, data); return; }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function setConfirmation(
  activityId: string, eventId: string, participantEmail: string, status: "confirmed" | "rejected"
): Promise<Confirmation> {
  const store = await read();
  const existing = store.confirmations.find((c) => c.activityId === activityId);
  if (existing) {
    existing.status = status;
    existing.confirmedAt = new Date().toISOString();
    await write(store);
    return existing;
  }
  const entry: Confirmation = { id: crypto.randomUUID(), activityId, eventId, participantEmail, status, confirmedAt: new Date().toISOString() };
  store.confirmations.push(entry);
  await write(store);
  return entry;
}

export async function removeConfirmation(activityId: string): Promise<void> {
  const store = await read();
  store.confirmations = store.confirmations.filter((c) => c.activityId !== activityId);
  await write(store);
}

export async function getConfirmationsByEvent(eventId: string): Promise<Confirmation[]> {
  return (await read()).confirmations.filter((c) => c.eventId === eventId);
}

export async function getConfirmedEventIds(participantEmail: string): Promise<string[]> {
  return (await read()).confirmations
    .filter((c) => c.participantEmail === participantEmail && c.status === "confirmed")
    .map((c) => c.eventId);
}

export async function getAllConfirmations(): Promise<Confirmation[]> {
  return (await read()).confirmations;
}
