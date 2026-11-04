import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";
const schema = z.object({ availability: z.enum(["AVAILABLE", "OFFLINE"]) });
export async function PATCH(request: Request) {
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true, providerProfile: { select: { id: true, verification: true } } } });
  if (user?.role !== "PROVIDER" || !user.providerProfile || user.providerProfile.verification !== "APPROVED") return NextResponse.json({ ok: false, message: "Approved provider account required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Availability सही चुनें।" }, { status: 400 });
  try {
    const profile = await prisma.providerProfile.update({ where: { id: user.providerProfile.id }, data: { availability: parsed.data.availability }, select: { availability: true } });
    return NextResponse.json({ ok: true, availability: profile.availability });
  } catch (error) {
    console.error("Provider availability update error:", error);
    return NextResponse.json({ ok: false, message: "Availability update नहीं हुई।" }, { status: 503 });
  }
}
