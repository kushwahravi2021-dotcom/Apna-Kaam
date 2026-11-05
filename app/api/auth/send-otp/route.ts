import { NextResponse } from "next/server";
import { createHmac, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/auth";

export const runtime = "nodejs";

function placeholderHash(phone: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return createHmac("sha256", secret).update(phone + ":" + randomBytes(16).toString("hex")).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizePhone(String(body.phone ?? ""));
  if (!phone) return NextResponse.json({ ok: false, message: "10 अंकों का सही mobile number डालें।" }, { status: 400 });

  const demoMode = process.env.DEMO_MODE === "true";
  const development = process.env.NODE_ENV !== "production" || demoMode;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!development && (!accountSid || !authToken || !verifyServiceSid)) {
    return NextResponse.json({ ok: false, message: "OTP Verify service configure नहीं है।" }, { status: 503 });
  }

  try {
    const recent = await prisma.otpChallenge.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true }
    });
    if (recent && Date.now() - recent.createdAt.getTime() < 30_000) {
      return NextResponse.json({ ok: false, message: "नया OTP भेजने से पहले 30 सेकंड रुकें।" }, { status: 429 });
    }

    await prisma.otpChallenge.deleteMany({ where: { phone } });

    if (development) {
      const code = "123456";
      await prisma.otpChallenge.create({
        data: {
          phone,
          codeHash: createHmac("sha256", process.env.AUTH_SECRET!).update(phone + ":" + code).digest("hex"),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        }
      });
      return NextResponse.json({ ok: true, message: "OTP भेज दिया गया है।", devOtp: code });
    }

    const url = "https://verify.twilio.com/v2/Services/" + verifyServiceSid + "/Verifications";
    const auth = Buffer.from(accountSid + ":" + authToken).toString("base64");
    const form = new URLSearchParams({ To: phone, Channel: "sms" });
    const sms = await fetch(url, {
      method: "POST",
      headers: { Authorization: "Basic " + auth, "Content-Type": "application/x-www-form-urlencoded" },
      body: form
    });

    if (!sms.ok) {
      console.error("Twilio Verify send error:", await sms.text());
      return NextResponse.json({ ok: false, message: "OTP SMS भेजा नहीं जा सका।" }, { status: 502 });
    }

    await prisma.otpChallenge.create({
      data: {
        phone,
        codeHash: placeholderHash(phone),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    return NextResponse.json({ ok: true, message: "OTP भेज दिया गया है।" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ ok: false, message: "OTP अभी भेजा नहीं जा सका।" }, { status: 503 });
  }
}
