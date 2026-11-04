import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";

const schema = z.object({ status: z.enum(["ACCEPTED","REJECTED","ON_THE_WAY","ARRIVED","WORK_STARTED","COMPLETED"]) });
const transitions: Record<string, string[]> = {
  NEW: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["ON_THE_WAY"],
  ON_THE_WAY: ["ARRIVED"],
  ARRIVED: ["WORK_STARTED"],
  WORK_STARTED: ["COMPLETED"],
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true, providerProfile: { select: { id: true, verification: true } } } });
  if (user?.role !== "PROVIDER" || !user.providerProfile || user.providerProfile.verification !== "APPROVED") {
    return NextResponse.json({ ok: false, message: "Approved provider account required." }, { status: 403 });
  }
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid booking status." }, { status: 400 });
  try {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id, providerId: user.providerProfile!.id },
        select: { id: true, customerId: true, status: true },
      });
      if (!booking) return { error: "NOT_FOUND" as const };
      if (!transitions[booking.status]?.includes(parsed.data.status)) return { error: "INVALID_TRANSITION" as const };
      const updated = await tx.booking.update({ where: { id }, data: { status: parsed.data.status }, select: { id: true, status: true } });
      await tx.bookingStatusHistory.create({ data: { bookingId: id, status: parsed.data.status, note: "Provider ने booking status update किया।" } });
      await tx.notification.create({ data: { userId: booking.customerId, title: "Booking update", body: "आपकी booking का status: " + parsed.data.status } });
      return { booking: updated };
    });
    if ("error" in result) {
      if (result.error === "NOT_FOUND") return NextResponse.json({ ok: false, message: "Booking नहीं मिली।" }, { status: 404 });
      return NextResponse.json({ ok: false, message: "यह status अभी update नहीं किया जा सकता।" }, { status: 409 });
    }
    return NextResponse.json({ ok: true, booking: result.booking });
  } catch (error) {
    console.error("Provider booking update error:", error);
    return NextResponse.json({ ok: false, message: "Booking update नहीं हो सकी।" }, { status: 503 });
  }
}
