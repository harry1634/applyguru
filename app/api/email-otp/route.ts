import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { storeOTP, verifyOTP } from "@/lib/otp-store";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const key = (email: string) => `email:${email.toLowerCase()}`;

export async function POST(req: NextRequest) {
  const body              = await req.json();
  const { action, email } = body;

  if (!email || !String(email).includes("@")) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (action === "send") {
    const code = generateOTP();
    await storeOTP(key(email), code);

    let emailDelivered = false;

    if (process.env.RESEND_API_KEY) {
      const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="max-width:480px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
          <div style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:28px 36px;">
            <p style="margin:0;color:#e9d5ff;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;">ApplyGuru</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:22px;">Verify your email</h1>
          </div>
          <div style="padding:36px;">
            <p style="margin:0 0 20px;color:#475569;font-size:15px;">Use this code to verify your email on ApplyGuru:</p>
            <div style="background:#f1f5f9;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
              <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:#1e293b;font-variant-numeric:tabular-nums;">${code}</span>
            </div>
            <p style="margin:0;color:#94a3b8;font-size:13px;">Expires in <strong>10 minutes</strong>. Do not share this code.</p>
          </div>
          <div style="padding:16px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&apos;t request this? You can safely ignore it.</p>
          </div>
        </div>
      </body></html>`;

      const { data, error } = await resend.emails.send({
        from:    "ApplyGuru <onboarding@resend.dev>",
        to:      email,
        subject: `${code} — Your ApplyGuru verification code`,
        html,
      });

      if (error) {
        // Resend free tier: onboarding@resend.dev can only deliver to the Resend account's own
        // verified email. For all other addresses, fall back to devCode in the response.
        console.warn("[Email OTP] Resend delivery failed:", JSON.stringify(error));
      } else {
        console.log("[Email OTP] Sent successfully, id:", data?.id);
        emailDelivered = true;
      }
    } else {
      console.log(`[DEV Email OTP — no RESEND_API_KEY] ${email} → ${code}`);
    }

    return NextResponse.json({
      success: true,
      // Return code in response when email could not be delivered (dev / Resend restriction)
      ...(!emailDelivered ? { devCode: code } : {}),
    });
  }

  if (action === "verify") {
    const result = await verifyOTP(key(email), String(body.otp ?? ""));
    if (result === "valid")   return NextResponse.json({ success: true });
    if (result === "expired") return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
