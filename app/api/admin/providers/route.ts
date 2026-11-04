import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  return user?.role === "ADMIN" ? session.userId : null;
}

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, message: "Admin access required." }, { status: 403 });
  const providers = await prisma.providerProfile.findMany({
    where: { verification: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, bio: true, experienceYears: true, startingPrice: true, serviceArea: true, verification: true, createdAt: true,
      user: { select: { id: true, name: true, phone: true, city: true, area: true } },
      services: { select: { category: { select: { id: true, name: true, icon: true } } } },
    },
  });
  return NextResponse.json({ ok: true, providers });
}

const reviewSchema = z.object({ providerId: z.string().min(1), decision: z.enum(["APPROVED", "REJECTED"]) });

export async function PATCH(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, message: "Admin access required." }, { status: 403 });
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid provider decision." }, { status: 400 });
  const { providerId, decision } = parsed.data;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const provider = await tx.providerProfile.findUnique({ where: { id: providerId }, select: { id: true, verification: true } });
      if (!provider || provider.verification !== "PENDING") return null;
      const updated = await tx.providerProfile.update({ where: { id: providerId }, data: { verification: decision } });
      await tx.adminAction.create({ data: { adminId, action: decision === "APPROVED" ? "PROVIDER_APPROVED" : "PROVIDER_REJECTED", targetType: "ProviderProfile", targetId: providerId } });
      return updated;
    });
    if (!result) return NextResponse.json({ ok: false, message: "Pending provider नहीं मिला।" }, { status: 404 });
    return NextResponse.json({ ok: true, message: decision === "APPROVED" ? "Provider approve हो गया।" : "Provider reject हो गया।" });
  } catch (error) {
    console.error("Admin provider review error:", error);
    return NextResponse.json({ ok: false, message: "Decision save नहीं हो सका।" }, { status: 503 });
  }
}
