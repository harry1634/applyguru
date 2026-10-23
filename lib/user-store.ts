import fs from "fs";
import path from "path";

export interface UserStats {
  eventsAttended: number;
  applicationsSent: number;
  certificatesEarned: number;
  volunteerHours: number;
  eventsCreated: number;
  jobsPosted: number;
  sessionsGiven: number;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  provider: string;
  role: "participant" | "organizer" | "counselor";
  onboardingComplete: boolean;
  stats?: UserStats;
  username?: string;
  phone?: string;
  city?: string;
  state?: string;
  college?: string;
  degree?: string;
  graduationYear?: string;
  userType?: "student" | "graduate" | "organization";
  orgName?: string;
  orgType?: string;
  orgContact?: string;
  orgWebsite?: string;
  firstLoginAt: string;
  lastLoginAt: string;
  loginCount: number;
}

const FILE = path.join(process.cwd(), "data", "users.json");
const REDIS_KEY = "applyguru:users";

// ── storage helpers ──────────────────────────────────────────────────────────

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  // Dynamic import so the package isn't required locally
  const { Redis } = require("@upstash/redis");
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

async function read(): Promise<{ users: StoredUser[] }> {
  const redis = getRedis();
  if (redis) {
    const data = (await redis.get(REDIS_KEY)) as { users: StoredUser[] } | null;
    return data ?? { users: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { users: [] };
  }
}

async function write(data: { users: StoredUser[] }): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, data);
    return;
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ── public API ────────────────────────────────────────────────────────────────

export async function upsertUser(
  user: { id: string; name?: string | null; email?: string | null; image?: string | null },
  provider: string,
  initialRole?: StoredUser["role"]
): Promise<StoredUser> {
  const store = await read();
  const now = new Date().toISOString();
  const existing = store.users.find((u) => u.email === user.email);

  if (existing) {
    existing.lastLoginAt = now;
    existing.loginCount += 1;
    if (user.name) existing.name = user.name;
    if (user.image !== undefined) existing.image = user.image ?? null;
    await write(store);
    return existing;
  }

  const newUser: StoredUser = {
    id: user.id || crypto.randomUUID(),
    name: user.name ?? "Unknown",
    email: user.email ?? "",
    image: user.image ?? null,
    provider,
    role: initialRole ?? "participant",
    onboardingComplete: false,
    firstLoginAt: now,
    lastLoginAt: now,
    loginCount: 1,
  };
  store.users.push(newUser);
  await write(store);
  return newUser;
}

export async function getAllUsers(): Promise<StoredUser[]> {
  return (await read()).users;
}

export async function getUserByEmail(email: string): Promise<StoredUser | undefined> {
  return (await read()).users.find((u) => u.email === email);
}

export async function updateUserRole(email: string, role: StoredUser["role"]): Promise<void> {
  const store = await read();
  const user = store.users.find((u) => u.email === email);
  if (user) { user.role = role; await write(store); }
}

export async function updateUserProfile(
  email: string,
  data: { phone?: string; college?: string; name?: string }
): Promise<void> {
  const store = await read();
  const user = store.users.find((u) => u.email === email);
  if (user) {
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.college !== undefined) user.college = data.college;
    if (data.name !== undefined) user.name = data.name;
    await write(store);
  }
}

export async function deleteUser(email: string): Promise<void> {
  const store = await read();
  store.users = store.users.filter((u) => u.email !== email);
  await write(store);
}

export async function incrementUserStat(email: string, stat: keyof UserStats): Promise<void> {
  const store = await read();
  const user = store.users.find((u) => u.email === email);
  if (user) {
    if (!user.stats) {
      user.stats = {
        eventsAttended: 0, applicationsSent: 0, certificatesEarned: 0,
        volunteerHours: 0, eventsCreated: 0, jobsPosted: 0, sessionsGiven: 0,
      };
    }
    user.stats[stat] = (user.stats[stat] ?? 0) + 1;
    await write(store);
  }
}

export async function completeOnboarding(email: string, data: Partial<StoredUser>): Promise<void> {
  const store = await read();
  const user = store.users.find((u) => u.email === email);
  if (user) {
    Object.assign(user, data, { onboardingComplete: true });
    await write(store);
  }
}
