import fs from "fs";
import path from "path";

interface OTPRecord {
  otp: string;
  expiresAt: number;
}

const FILE          = path.join(process.cwd(), "data", "otps.json");
const REDIS_PREFIX  = "applyguru:otp:";
const OTP_TTL_SECS  = 600; // 10 minutes

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const { Redis } = require("@upstash/redis");
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

async function readAll(): Promise<Record<string, OTPRecord>> {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return {}; }
}

async function writeAll(data: Record<string, OTPRecord>): Promise<void> {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function storeOTP(phone: string, otp: string): Promise<void> {
  const redis = getRedis();
  const record: OTPRecord = { otp, expiresAt: Date.now() + OTP_TTL_SECS * 1000 };
  if (redis) {
    await redis.set(`${REDIS_PREFIX}${phone}`, record, { ex: OTP_TTL_SECS });
    return;
  }
  const all = await readAll();
  all[phone] = record;
  await writeAll(all);
}

export async function verifyOTP(phone: string, otp: string): Promise<"valid" | "expired" | "invalid"> {
  const redis = getRedis();
  let record: OTPRecord | null = null;
  if (redis) {
    record = (await redis.get(`${REDIS_PREFIX}${phone}`)) as OTPRecord | null;
  } else {
    record = (await readAll())[phone] ?? null;
  }
  if (!record) return "expired";
  if (Date.now() > record.expiresAt) {
    if (!redis) { const all = await readAll(); delete all[phone]; await writeAll(all); }
    return "expired";
  }
  if (record.otp !== otp) return "invalid";
  // delete after successful verify
  if (redis) {
    await redis.del(`${REDIS_PREFIX}${phone}`);
  } else {
    const all = await readAll();
    delete all[phone];
    await writeAll(all);
  }
  return "valid";
}
