import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";

const bookingSchema = z.object({
  providerId: z.string().min(1),
  categoryId: z.string().min(1),
  description: z.string().trim().min(5).max(1000),
  scheduledAt: z.string().datetime(),
  address: z.object({
    label: z.string().trim().min(2).max(40),
    line1: z.string().trim().min(5).max(250),
    city: z.string().trim().min(2).max(80),
    area: z.string().trim().max(100).optional().default(""),
  }),
});

async function currentUser() {
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } });
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  if (user.role !== "CUSTOMER") return NextResponse.json({ ok: false, message: "Customer account required." }, { status: 403 });
  const bookings = await prisma.booking.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, description: true, scheduledAt: true, status: true, createdAt: true,
      category: { select: { name: true, icon: true } },
      provider: { select: { user: { select: { name: true, phone: true } } } },
      address: { select: { label: true, line1: true, city: true, area: true } },
      statusHistory: { orderBy: { createdAt: "asc" }, select: { status: true, note: true, createdAt: true } },
    },
  });
  return NextResponse.json({ ok: true, bookings });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  if (user.role !== "CUSTOMER") return NextResponse.json({ ok: false, message: "Customer account required." }, { status: 403 });
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Booking की जानकारी सही भरें।", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  const data = parsed.data;
  const scheduledAt = new Date(data.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() + 30 * 60 * 1000) {
    return NextResponse.json({ ok: false, message: "Booking कम से कम 30 मिनट आगे के समय की रखें।" }, { status: 400 });
  }
  try {
    const provider = await prisma.providerProfile.findFirst({
      where: { id: data.providerId, verification: "APPROVED", availability: "AVAILABLE", services: { some: { categoryId: data.categoryId } } },
      select: { id: true, userId: true },
    });
    if (!provider) return NextResponse.json({ ok: false, message: "यह provider इस service के लिए अभी उपलब्ध नहीं है।" }, { status: 404 });
    const booking = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: { userId: user.id, label: data.address.label, line1: data.address.line1, city: data.address.city, area: data.address.area || "" },
      });
      const created = await tx.booking.create({
        data: {
          customerId: user.id, providerId: provider.id, categoryId: data.categoryId, addressId: address.id,
          description: data.description, scheduledAt,
          statusHistory: { create: { status: "NEW", note: "Customer ने booking request भेजी।" } },
        },
        select: { id: true, status: true, scheduledAt: true },
      });
      await tx.notification.create({
        data: { userId: provider.userId, title: "नई booking", body: "आपको एक नई service booking मिली है।" },
      });
      return created;
    });
    return NextResponse.json({ ok: true, booking }, { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ ok: false, message: "Booking अभी create नहीं हो सकी।" }, { status: 503 });
  }
}
