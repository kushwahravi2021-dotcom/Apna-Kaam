import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";
export async function GET() {
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return NextResponse.json({ ok: false, message: "Admin login जरूरी है।" }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (admin?.role !== "ADMIN") return NextResponse.json({ ok: false, message: "Admin access required." }, { status: 403 });
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" }, take: 100,
      select: { id: true, description: true, scheduledAt: true, status: true, createdAt: true,
        category: { select: { name: true } },
        customer: { select: { name: true, phone: true } },
        provider: { select: { user: { select: { name: true, phone: true } } } },
        address: { select: { city: true, area: true, line1: true } },
        payment: { select: { status: true, amount: true } }
      }
    });
    return NextResponse.json({ ok: true, bookings });
  } catch (error) {
    console.error("Admin bookings read error:", error);
    return NextResponse.json({ ok: false, message: "Bookings load नहीं हुईं।" }, { status: 503 });
  }
}
