import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
// Use RESEND_FROM_EMAIL env var once you verify a custom domain at resend.com/domains
// Until then, onboarding@resend.dev only delivers to your own Resend account email (test mode)
const FROM = process.env.RESEND_FROM_EMAIL || "ApplyGuru <onboarding@resend.dev>";

type EmailType =
  | "welcome"
  | "event-registered"
  | "event-created"
  | "job-applied";

function buildHtml(type: EmailType, data: Record<string, string>): { subject: string; html: string } {
  const base = (body: string) => `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <div style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px 36px;">
          <p style="margin:0;color:#e9d5ff;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;">ApplyGuru</p>
        </div>
        <div style="padding:36px;">
          ${body}
        </div>
        <div style="padding:20px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            &copy; ${new Date().getFullYear()} ApplyGuru · India&rsquo;s largest opportunity platform
          </p>
        </div>
      </div>
    </body></html>
  `;

  if (type === "welcome") {
    const isOrg = data.userType === "organization";
    return {
      subject: `Welcome to ApplyGuru, ${data.name}! 🎉`,
      html: base(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#1e293b;">Welcome, ${data.name}! 🎉</h1>
        <p style="color:#64748b;font-size:15px;margin:0 0 24px;">
          Your ApplyGuru account is ready. ${isOrg ? "You can now post events, jobs, and connect with thousands of students." : "Discover thousands of events, jobs, workshops, and counseling sessions tailored for you."}
        </p>
        <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1e293b;">Your account details</p>
          <p style="margin:0 0 4px;color:#64748b;font-size:14px;">📧 ${data.email}</p>
          <p style="margin:0 0 4px;color:#64748b;font-size:14px;">👤 ${isOrg ? "Organisation" : data.userType === "student" ? "Student" : "Graduate"} account</p>
          ${data.college ? `<p style="margin:0;color:#64748b;font-size:14px;">🎓 ${data.college}</p>` : ""}
          ${data.orgName ? `<p style="margin:0;color:#64748b;font-size:14px;">🏢 ${data.orgName}</p>` : ""}
        </div>
        ${isOrg
          ? `<p style="color:#64748b;font-size:14px;margin:0 0 24px;">Start by creating your first event or posting a job opening to reach our community.</p>
             <a href="https://applyguru.in/organizers/create" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">Create First Event →</a>`
          : `<p style="color:#64748b;font-size:14px;margin:0 0 24px;">Complete your profile and start exploring opportunities that match your skills and interests.</p>
             <a href="https://applyguru.in/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">Go to Dashboard →</a>`
        }
      `),
    };
  }

  if (type === "event-registered") {
    return {
      subject: `You're registered for ${data.eventName}! 🎉`,
      html: base(`
        <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">Registration Confirmed! 🎉</h1>
        <p style="color:#64748b;font-size:15px;margin:0 0 24px;">Hi ${data.name}, you&rsquo;re all set for the event below.</p>
        <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#1e293b;">${data.eventName}</p>
          <p style="margin:0 0 4px;color:#64748b;font-size:14px;">📅 ${data.eventDate}</p>
          <p style="margin:0 0 4px;color:#64748b;font-size:14px;">🖥️ ${data.eventMode}</p>
          ${data.eventLocation ? `<p style="margin:0;color:#64748b;font-size:14px;">📍 ${data.eventLocation}</p>` : ""}
        </div>
        <p style="color:#64748b;font-size:14px;margin:0 0 24px;">
          A reminder will be sent 24 hours before the event starts. Add it to your calendar so you don&rsquo;t miss it!
        </p>
        <a href="https://applyguru.in/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          View in Dashboard →
        </a>
      `),
    };
  }

  if (type === "event-created") {
    return {
      subject: `Your event "${data.eventName}" is now live! 🚀`,
      html: base(`
        <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">Event Published! 🚀</h1>
        <p style="color:#64748b;font-size:15px;margin:0 0 24px;">Hi ${data.name}, your event is live and visible to 500K+ students.</p>
        <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#1e293b;">${data.eventName}</p>
          <p style="margin:0 0 4px;color:#64748b;font-size:14px;">📅 ${data.eventDate}</p>
          <p style="margin:0 0 4px;color:#64748b;font-size:14px;">🖥️ ${data.eventMode}</p>
          ${data.capacity ? `<p style="margin:0;color:#64748b;font-size:14px;">👥 Max ${data.capacity} attendees</p>` : ""}
        </div>
        <p style="color:#64748b;font-size:14px;margin:0 0 8px;">What happens next:</p>
        <ul style="color:#64748b;font-size:14px;margin:0 0 24px;padding-left:20px;line-height:1.8;">
          <li>Students can discover and register immediately</li>
          <li>You&rsquo;ll get email alerts as registrations come in</li>
          <li>Manage everything from your Organizer Dashboard</li>
        </ul>
        <a href="https://applyguru.in/organizers/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          Go to Dashboard →
        </a>
      `),
    };
  }

  // job-applied
  return {
    subject: `Application sent to ${data.company} for ${data.jobTitle}! ✅`,
    html: base(`
      <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">Application Submitted! ✅</h1>
      <p style="color:#64748b;font-size:15px;margin:0 0 24px;">Hi ${data.name}, your application has been sent successfully.</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#1e293b;">${data.jobTitle}</p>
        <p style="margin:0 0 4px;color:#64748b;font-size:14px;">🏢 ${data.company}</p>
        <p style="margin:0;color:#64748b;font-size:14px;">📍 ${data.location || "Remote"}</p>
      </div>
      <p style="color:#64748b;font-size:14px;margin:0 0 24px;">
        The recruiter will review your profile and reach out if there&rsquo;s a match. Track your application status in My Applications.
      </p>
      <a href="https://applyguru.in/applications" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
        Track Application →
      </a>
    `),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, data } = body as { type: EmailType; to: string; data: Record<string, string> };

    if (!to || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      // Email not configured — silently succeed so UI still works
      return NextResponse.json({ success: true, skipped: true });
    }

    const { subject, html } = buildHtml(type, data);

    const { error } = await resend.emails.send({ from: FROM, to, subject, html });

    if (error) return NextResponse.json({ error }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
