import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSessionToken, normalizePhone, sessionCookieName, sessionMaxAge } from "@/lib/auth";

export const runtime = "nodejs";
function hashCode(phone: string, code: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return createHmac("sha256", secret).update(phone + ":" + code).digest();
}
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizePhone(String(body.phone ?? ""));
  const code = String(body.code ?? "").trim();
  if (!phone || !/^\d{6}$/.test(code)) return NextResponse.json({ ok: false, message: "Phone और 6 अंकों का OTP जरूरी है।" }, { status: 400 });
  try {
    const challenge = await prisma.otpChallenge.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
    if (!challenge || challenge.expiresAt.getTime() < Date.now()) return NextResponse.json({ ok: false, message: "OTP expire हो गया है। नया OTP लें।" }, { status: 401 });
    if (challenge.attempts >= 5) return NextResponse.json({ ok: false, message: "बहुत बार गलत OTP डाला गया। नया OTP लें।" }, { status: 429 });
    const supplied = hashCode(phone, code);
    const expected = Buffer.from(challenge.codeHash, "hex");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ ok: false, message: "OTP गलत है।" }, { status: 401 });
    }
    await prisma.otpChallenge.delete({ where: { id: challenge.id } });
    const user = await prisma.user.upsert({
      where: { phone }, update: {}, create: { phone, customerProfile: { create: {} } },
      select: { id: true, phone: true, role: true, name: true }
    });
    const response = NextResponse.json({ ok: true, user });
    response.cookies.set(sessionCookieName, createSessionToken({ id: user.id, role: user.role }), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: sessionMaxAge
    });
    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ ok: false, message: "Login अभी पूरा नहीं हो सका।" }, { status: 503 });
  }
}
