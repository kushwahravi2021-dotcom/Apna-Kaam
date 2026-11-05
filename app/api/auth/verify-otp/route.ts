import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, normalizePhone, sessionCookieName, sessionMaxAge } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizePhone(String(body.phone ?? ""));
  const code = String(body.code ?? "").trim();

  if (!phone || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, message: "Phone और 6 अंकों का OTP जरूरी है।" }, { status: 400 });
  }

  try {
    const challenge = await prisma.otpChallenge.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" }
    });

    if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ ok: false, message: "OTP expire हो गया है। नया OTP लें।" }, { status: 401 });
    }

    if (challenge.attempts >= 5) {
      return NextResponse.json({ ok: false, message: "बहुत बार गलत OTP डाला गया। नया OTP लें।" }, { status: 429 });
    }

    const demoMode = process.env.DEMO_MODE === "true";
    const development = process.env.NODE_ENV !== "production" || demoMode;

    if (development) {
      const crypto = await import("crypto");
      const expected = crypto.createHmac("sha256", process.env.AUTH_SECRET!).update(phone + ":123456").digest("hex");
      if (challenge.codeHash !== expected) {
        return NextResponse.json({ ok: false, message: "OTP गलत है।" }, { status: 401 });
      }
    } else {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

      if (!accountSid || !authToken || !verifyServiceSid) {
        return NextResponse.json({ ok: false, message: "OTP Verify service configure नहीं है।" }, { status: 503 });
      }

      const url = "https://verify.twilio.com/v2/Services/" + verifyServiceSid + "/VerificationCheck";
      const auth = Buffer.from(accountSid + ":" + authToken).toString("base64");
      const form = new URLSearchParams({ To: phone, Code: code });
      const check = await fetch(url, {
        method: "POST",
        headers: { Authorization: "Basic " + auth, "Content-Type": "application/x-www-form-urlencoded" },
        body: form
      });

      if (!check.ok) {
        const details = await check.text();
        console.error("Twilio Verify check error:", details);
        return NextResponse.json({ ok: false, message: "OTP verify नहीं हो सका।" }, { status: 502 });
      }

      const result = await check.json() as { status?: string };
      if (result.status !== "approved") {
        await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
        return NextResponse.json({ ok: false, message: "OTP गलत है।" }, { status: 401 });
      }
    }

    await prisma.otpChallenge.delete({ where: { id: challenge.id } });

    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, customerProfile: { create: {} } },
      select: { id: true, phone: true, role: true, name: true }
    });

    const response = NextResponse.json({ ok: true, user });
    response.cookies.set(sessionCookieName, createSessionToken({ id: user.id, role: user.role }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAge
    });
    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ ok: false, message: "Login अभी पूरा नहीं हो सका।" }, { status: 503 });
  }
}
