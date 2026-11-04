import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";

const providerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(500).optional().default(""),
  experienceYears: z.coerce.number().int().min(0).max(60),
  startingPrice: z.coerce.number().positive().max(1000000),
  categoryIds: z.array(z.string().min(1)).min(1).max(12),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  if (session.role === "ADMIN") return NextResponse.json({ ok: false, message: "Admin provider registration नहीं कर सकता।" }, { status: 403 });

  const parsed = providerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "कृपया सभी जरूरी जानकारी सही भरें।", errors: parsed.error.flatten().fieldErrors }, { status: 400 });

  const data = parsed.data;
  try {
    const categories = await prisma.category.findMany({
      where: { id: { in: data.categoryIds }, active: true },
      select: { id: true },
    });
    if (categories.length !== new Set(data.categoryIds).size) {
      return NextResponse.json({ ok: false, message: "चुनी गई service category उपलब्ध नहीं है।" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.userId },
        data: { name: data.name, city: data.city, area: data.area, role: "PROVIDER" },
      });
      await tx.providerProfile.upsert({
        where: { userId: session.userId },
        update: {
          bio: data.bio,
          experienceYears: data.experienceYears,
          startingPrice: data.startingPrice,
          serviceArea: data.area,
          verification: "PENDING",
          availability: "OFFLINE",
          services: { deleteMany: {}, create: data.categoryIds.map((categoryId) => ({ categoryId })) },
        },
        create: {
          userId: session.userId,
          bio: data.bio,
          experienceYears: data.experienceYears,
          startingPrice: data.startingPrice,
          serviceArea: data.area,
          verification: "PENDING",
          availability: "OFFLINE",
          services: { create: data.categoryIds.map((categoryId) => ({ categoryId })) },
        },
      });
    });

    return NextResponse.json({ ok: true, message: "Registration submit हो गया। Admin approval के बाद आपकी profile दिखाई जाएगी।" });
  } catch (error) {
    console.error("Provider registration error:", error);
    return NextResponse.json({ ok: false, message: "Registration अभी submit नहीं हो सका।" }, { status: 503 });
  }
}
