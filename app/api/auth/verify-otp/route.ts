import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, normalizePhone, sessionCookieName, sessionMaxAge, verifyOtp } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizePhone(String(body.phone ?? ""));
  const code = String(body.code ?? "").trim();
  if (!phone || !/^\\d{6}$/.test(code)) return NextResponse.json({ ok: false, message: "Phone and 6 digit OTP required." }, { status: 400 });

  if (!verifyOtp(phone, code)) return NextResponse.json({ ok: false, message: "OTP invalid or expired." }, { status: 401 });

  try {
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, customerProfile: { create: {} } },
      select: { id: true, phone: true, role: true, name: true },
    });

    const token = createSessionToken({ id: user.id, role: user.role });
    const response = NextResponse.json({ ok: true, user });
    response.cookies.set(sessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAge,
    });
    return response;
  } catch (error) {
    console.error("OTP verification account/session error:", error);
    return NextResponse.json({ ok: false, message: "Login अभी पूरा नहीं हो सका। कृपया बाद में कोशिश करें।" }, { status: 503 });
  }
}
