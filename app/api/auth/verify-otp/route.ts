import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone, verifyOtp } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizePhone(String(body.phone ?? ""));
  const code = String(body.code ?? "").trim();
  if (!phone || !/^\d{6}$/.test(code)) return NextResponse.json({ ok: false, message: "Phone and 6 digit OTP required." }, { status: 400 });

  if (!verifyOtp(phone, code)) return NextResponse.json({ ok: false, message: "OTP invalid or expired." }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone, customerProfile: { create: {} } },
    select: { id: true, phone: true, role: true, name: true },
  });

  return NextResponse.json({ ok: true, user });
}
