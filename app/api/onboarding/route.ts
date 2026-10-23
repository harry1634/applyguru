import { NextRequest, NextResponse } from "next/server";
import { completeOnboarding, getUserByEmail } from "@/lib/user-store";
import type { StoredUser } from "@/lib/user-store";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<StoredUser> & { email: string };
  if (!body.email) return NextResponse.json({ error: "email required" }, { status: 400 });

  await completeOnboarding(body.email, body);

  if (process.env.RESEND_API_KEY) {
    const user = await getUserByEmail(body.email);
    const name = (body.name ?? user?.name ?? "there").split(" ")[0];
    const isOrg = body.userType === "organization";
    const subject = `Welcome to ApplyGuru, ${name}! 🎉`;
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,sans-serif;">
      <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <div style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px 36px;">
          <p style="margin:0;color:#e9d5ff;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;">ApplyGuru</p>
        </div>
        <div style="padding:36px;">
          <h1 style="margin:0 0 8px;font-size:24px;color:#1e293b;">Welcome, ${name}! 🎉</h1>
          <p style="color:#64748b;font-size:15px;margin:0 0 24px;">
            ${isOrg ? "Your organisation account is ready. Post events, jobs, and connect with thousands of students." : "Your ApplyGuru account is ready. Discover events, jobs, workshops, and counseling sessions made for you."}
          </p>
          <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 4px;color:#64748b;font-size:14px;">📧 ${body.email}</p>
            <p style="margin:0 0 4px;color:#64748b;font-size:14px;">👤 ${isOrg ? "Organisation" : body.userType === "student" ? "Student" : "Graduate"} account</p>
            ${body.college ? `<p style="margin:0;color:#64748b;font-size:14px;">🎓 ${body.college}</p>` : ""}
            ${body.orgName ? `<p style="margin:0;color:#64748b;font-size:14px;">🏢 ${body.orgName}</p>` : ""}
          </div>
          <a href="${process.env.NEXTAUTH_URL ?? "https://applyguru.vercel.app"}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
            ${isOrg ? "Go to Organizer Dashboard →" : "Explore Opportunities →"}
          </a>
        </div>
        <div style="padding:20px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; ${new Date().getFullYear()} ApplyGuru · India's largest opportunity platform</p>
        </div>
      </div>
    </body></html>`;
    await resend.emails.send({ from: "ApplyGuru <onboarding@resend.dev>", to: body.email, subject, html }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
