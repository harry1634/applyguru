import type { Activity } from "./activity-store";

export async function trackActivity(
  activity: Omit<Activity, "id" | "timestamp">
): Promise<Activity | null> {
  try {
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity),
    });
    const { activity: saved } = await res.json();
    return saved ?? null;
  } catch {
    return null;
  }
}
