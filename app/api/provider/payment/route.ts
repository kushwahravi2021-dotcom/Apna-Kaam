import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readSessionToken, sessionCookieName } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  upiId: z.string().trim().max(100).optional().default(""),
  bankAccountName: z.string().trim().max(120).optional().default(""),
  bankAccountNumber: z.string().trim().max(40).optional().default(""),
  bankIfsc: z.string().trim().max(20).optional().default(""),
});

async function getProvider() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true, providerProfile: { select: { id: true, upiId: true, bankAccountName: true, bankAccountNumber: true, bankIfsc: true } } } });
  if (!user || user.role !== "PROVIDER" || !user.providerProfile) return null;
  return user;
}

export async function GET() {
  const user = await getProvider();
  if (!user) return NextResponse.json({ ok: false, message: "Provider access required." }, { status: 403 });
  const payment = user.providerProfile;
  return NextResponse.json({
    ok: true,
    payment: {
      ...payment,
      bankAccountNumber: payment.bankAccountNumber
        ? "••••" + payment.bankAccountNumber.slice(-4)
        : null,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await getProvider();
  if (!user) return NextResponse.json({ ok: false, message: "Provider access required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Payment details सही भरें।" }, { status: 400 });
  const data = parsed.data;
  if (!user.providerProfile) return NextResponse.json({ ok: false, message: "Provider profile नहीं मिला." }, { status: 404 });
  const updated = await prisma.providerProfile.update({ where: { id: user.providerProfile.id }, data: { upiId: data.upiId || null, bankAccountName: data.bankAccountName || null, bankAccountNumber: data.bankAccountNumber || null, bankIfsc: data.bankIfsc || null }, select: { upiId: true, bankAccountName: true, bankAccountNumber: true, bankIfsc: true } });
  return NextResponse.json({ ok: true, payment: updated, message: "Payment details save हो गईं।" });
}
