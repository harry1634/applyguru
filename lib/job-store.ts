import fs from "fs";
import path from "path";

export interface StoredJob {
  id: string;
  organizerEmail: string;
  organizerName: string;
  title: string;
  company: string;
  jobType: string;
  department: string;
  workMode: string;
  location: string;
  minSalary: string;
  maxSalary: string;
  stipend: string;
  duration: string;
  openings: string;
  deadline: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  perks: string;
  status: "published" | "draft";
  createdAt: string;
}

const FILE      = path.join(process.cwd(), "data", "jobs.json");
const REDIS_KEY = "applyguru:jobs";

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const { Redis } = require("@upstash/redis");
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

async function read(): Promise<{ jobs: StoredJob[] }> {
  const redis = getRedis();
  if (redis) {
    const data = (await redis.get(REDIS_KEY)) as { jobs: StoredJob[] } | null;
    return data ?? { jobs: [] };
  }
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return { jobs: [] }; }
}

async function write(data: { jobs: StoredJob[] }): Promise<void> {
  const redis = getRedis();
  if (redis) { await redis.set(REDIS_KEY, data); return; }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function createJob(job: Omit<StoredJob, "id" | "createdAt">): Promise<StoredJob> {
  const store = await read();
  const entry: StoredJob = { ...job, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  store.jobs.push(entry);
  await write(store);
  return entry;
}

export async function getPublishedJobs(): Promise<StoredJob[]> {
  return (await read()).jobs
    .filter((j) => j.status === "published")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllJobs(): Promise<StoredJob[]> {
  return (await read()).jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getJobById(id: string): Promise<StoredJob | null> {
  return (await read()).jobs.find((j) => j.id === id) ?? null;
}

export async function getJobsByOrganizer(email: string): Promise<StoredJob[]> {
  return (await read()).jobs
    .filter((j) => j.organizerEmail === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateJobStatus(id: string, status: "published" | "draft"): Promise<StoredJob | null> {
  const store = await read();
  const idx = store.jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;
  store.jobs[idx].status = status;
  await write(store);
  return store.jobs[idx];
}
