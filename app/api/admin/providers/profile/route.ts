import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";

async function requireAdmin() {
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  return user?.role === "ADMIN" ? session.userId : null;
}

const schema = z.object({
  providerId: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120).optional().or(z.literal("")).default(""),
  phone: z.string().trim().regex(/^\\+?[0-9]{10,15}$/),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().max(100).optional().default(""),
  serviceArea: z.string().trim().max(100).optional().default(""),
  bio: z.string().trim().max(500).optional().default(""),
  experienceYears: z.coerce.number().int().min(0).max(60),
  startingPrice: z.coerce.number().positive().max(1000000),
});

export async function GET(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, message: "Admin access required." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("providerId");
  if (!id) return NextResponse.json({ ok: false, message: "Provider ID required." }, { status: 400 });
  const provider = await prisma.providerProfile.findUnique({
    where: { id },
    select: {
      id: true, bio: true, experienceYears: true, startingPrice: true, serviceArea: true,
      verification: true, availability: true, deletedAt: true, createdAt: true, updatedAt: true,
      verificationDocumentUrl: true,
      user: { select: { id: true, name: true, email: true, phone: true, city: true, area: true, avatarUrl: true, createdAt: true } },
      services: { select: { category: { select: { id: true, name: true, icon: true } } } },
    },
  });
  if (!provider) return NextResponse.json({ ok: false, message: "Provider नहीं मिला।" }, { status: 404 });
  return NextResponse.json({ ok: true, provider });
}

export async function PATCH(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, message: "Admin access required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Provider details सही भरें।", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  const d = parsed.data;
  try {
    const existing = await prisma.user.findFirst({ where: { phone: d.phone, NOT: { id: (await prisma.providerProfile.findUnique({ where: { id: d.providerId }, select: { userId: true } }))?.userId } }, select: { id: true } });
    if (existing) return NextResponse.json({ ok: false, message: "यह mobile number किसी दूसरे account में है।" }, { status: 409 });
    const provider = await prisma.providerProfile.update({
      where: { id: d.providerId },
      data: {
        bio: d.bio || null, experienceYears: d.experienceYears, startingPrice: d.startingPrice, serviceArea: d.serviceArea || null,
        user: { update: { name: d.name, email: d.email || null, phone: d.phone, city: d.city, area: d.area || null } },
      },
      select: { id: true },
    });
    await prisma.adminAction.create({ data: { adminId, action: "PROVIDER_PROFILE_EDITED", targetType: "ProviderProfile", targetId: provider.id, metadata: { fields: ["name","email","phone","city","area","serviceArea","bio","experienceYears","startingPrice"] } } });
    return NextResponse.json({ ok: true, message: "Provider profile update हो गई।" });
  } catch (error) {
    console.error("Admin provider profile edit:", error);
    return NextResponse.json({ ok: false, message: "Provider profile save नहीं हो सकी।" }, { status: 503 });
  }
}
