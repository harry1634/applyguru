import { NextRequest, NextResponse } from "next/server";
import { storeOTP, verifyOTP } from "@/lib/otp-store";

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendViaSMS(digits: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    console.log(`[DEV OTP — no FAST2SMS_API_KEY] +91${digits} → ${otp}`);
    return { ok: true };
  }
  try {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: { authorization: apiKey, "Content-Type": "application/json" },
      // "otp" route uses Fast2SMS's pre-approved DLT template — no custom message needed
      body: JSON.stringify({ variables_values: otp, route: "otp", numbers: digits }),
    });
    const data = await res.json();
    console.log("[Fast2SMS response]", JSON.stringify(data));
    if (data.return === true || data.return === "true") return { ok: true };
    const errMsg = Array.isArray(data.message) ? data.message.join(", ") : String(data.message ?? "Unknown error");
    return { ok: false, error: `SMS failed: ${errMsg}` };
  } catch (e) {
    console.error("[Fast2SMS error]", e);
    return { ok: false, error: "Could not reach SMS gateway." };
  }
}

export async function POST(req: NextRequest) {
  const body       = await req.json();
  const { action } = body;
  const rawPhone   = String(body.phone ?? "");

  const digits = rawPhone.replace(/\D/g, "").replace(/^91/, "");
  if (digits.length !== 10) {
    return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }

  if (action === "send") {
    const code   = generateOTP();
    await storeOTP(digits, code);
    const result = await sendViaSMS(digits, code);
    if (!result.ok) return NextResponse.json({ error: result.error ?? "Could not send OTP. Please try again." }, { status: 500 });
    // In dev (no API key) always return the OTP in the response so it's visible in the UI
    const isDev = !process.env.FAST2SMS_API_KEY;
    return NextResponse.json({ success: true, ...(isDev ? { devOtp: code } : {}) });
  }

  if (action === "verify") {
    const result = await verifyOTP(digits, String(body.otp ?? ""));
    if (result === "valid")   return NextResponse.json({ success: true });
    if (result === "expired") return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 });
    return NextResponse.json({ error: "Incorrect OTP. Please try again." }, { status: 400 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
