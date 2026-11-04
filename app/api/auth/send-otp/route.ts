import { NextResponse } from "next/server";
import { createHmac, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/auth";

export const runtime = "nodejs";
function hashCode(phone: string, code: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return createHmac("sha256", secret).update(phone + ":" + code).digest("hex");
}
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizePhone(String(body.phone ?? ""));
  if (!phone) return NextResponse.json({ ok: false, message: "10 अंकों का सही mobile number डालें।" }, { status: 400 });
  const demoMode = process.env.DEMO_MODE === "true";
  const development = process.env.NODE_ENV !== "production" || demoMode;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!development && (!accountSid || !authToken || !fromNumber)) {
    return NextResponse.json({ ok: false, message: "OTP SMS service configure नहीं है।" }, { status: 503 });
  }
  try {
    const recent = await prisma.otpChallenge.findFirst({ where: { phone }, orderBy: { createdAt: "desc" }, select: { createdAt: true } });
    if (recent && Date.now() - recent.createdAt.getTime() < 30_000) {
      return NextResponse.json({ ok: false, message: "नया OTP भेजने से पहले 30 सेकंड रुकें।" }, { status: 429 });
    }
    await prisma.otpChallenge.deleteMany({ where: { phone } });
    const code = development ? "123456" : randomInt(100000, 1000000).toString();
    const challenge = await prisma.otpChallenge.create({ data: { phone, codeHash: hashCode(phone, code), expiresAt: new Date(Date.now() + 5 * 60 * 1000) } });
    if (!development) {
      const url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";
      const auth = Buffer.from(accountSid + ":" + authToken).toString("base64");
      const form = new URLSearchParams({ To: phone, From: fromNumber!, Body: "Your Apna Kaam verification code is " + code + ". It expires in 5 minutes." });
      const sms = await fetch(url, { method: "POST", headers: { Authorization: "Basic " + auth, "Content-Type": "application/x-www-form-urlencoded" }, body: form });
      if (!sms.ok) {
        await prisma.otpChallenge.delete({ where: { id: challenge.id } });
        console.error("OTP SMS provider error:", await sms.text());
        return NextResponse.json({ ok: false, message: "OTP SMS भेजा नहीं जा सका।" }, { status: 502 });
      }
    }
    return NextResponse.json({ ok: true, message: "OTP भेज दिया गया है।", ...(development ? { devOtp: code } : {}) });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ ok: false, message: "OTP अभी भेजा नहीं जा सका।" }, { status: 503 });
  }
}
