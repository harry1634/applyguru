type EmailPayload =
  | { type: "welcome";          to: string; data: { name: string; email: string; userType: string; college?: string; orgName?: string } }
  | { type: "event-registered"; to: string; data: { name: string; eventName: string; eventDate: string; eventMode: string; eventLocation?: string } }
  | { type: "event-created";    to: string; data: { name: string; eventName: string; eventDate: string; eventMode: string; capacity?: string } }
  | { type: "job-applied";      to: string; data: { name: string; jobTitle: string; company: string; location?: string } };

export async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-critical — don't block the UI if email fails
  }
}
