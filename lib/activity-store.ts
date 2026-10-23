import fs from "fs";
import path from "path";

export interface Activity {
  id: string;
  email: string;
  type: "event-registered" | "workshop-enrolled" | "webinar-registered" | "event-created" | "job-applied" | "job-posted";
  itemId: string;
  itemTitle: string;
  itemDetails?: string;
  timestamp: string;
}

const FILE      = path.join(process.cwd(), "data", "activities.json");
const REDIS_KEY = "applyguru:activities";

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const { Redis } = require("@upstash/redis");
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

async function read(): Promise<{ activities: Activity[] }> {
  const redis = getRedis();
  if (redis) {
    const data = (await redis.get(REDIS_KEY)) as { activities: Activity[] } | null;
    return data ?? { activities: [] };
  }
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return { activities: [] }; }
}

async function write(data: { activities: Activity[] }): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, data);
    return;
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function addActivity(activity: Omit<Activity, "id" | "timestamp">): Promise<Activity> {
  const store = await read();
  const entry: Activity = { ...activity, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
  store.activities.push(entry);
  await write(store);
  return entry;
}

export async function getActivitiesByEmail(email: string): Promise<Activity[]> {
  return (await read()).activities
    .filter((a) => a.email === email)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function getAllActivities(): Promise<Activity[]> {
  return (await read()).activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function removeActivity(id: string, email: string): Promise<boolean> {
  const store = await read();
  const before = store.activities.length;
  store.activities = store.activities.filter((a) => !(a.id === id && a.email === email));
  if (store.activities.length === before) return false;
  await write(store);
  return true;
}

export async function getUserActivitySummary(email: string) {
  const acts = await getActivitiesByEmail(email);
  return {
    eventsRegistered: acts.filter((a) => ["event-registered","workshop-enrolled","webinar-registered"].includes(a.type)).length,
    eventsCreated:    acts.filter((a) => a.type === "event-created").length,
    jobsApplied:      acts.filter((a) => a.type === "job-applied").length,
    jobsPosted:       acts.filter((a) => a.type === "job-posted").length,
    recentActivities: acts.slice(0, 10),
  };
}
