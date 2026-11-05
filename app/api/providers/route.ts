import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim();
  const area = searchParams.get("area")?.trim();
  const categoryId = searchParams.get("categoryId")?.trim();
  const categoryName = searchParams.get("service")?.trim();
  try {
    const providers = await prisma.providerProfile.findMany({
      where: {
        verification: "APPROVED",
        availability: "AVAILABLE",
        deletedAt: null,
        ...(city ? { user: { city: { equals: city, mode: "insensitive" } } } : {}),
        ...(area ? { serviceArea: { contains: area, mode: "insensitive" } } : {}),
        ...(categoryId ? { services: { some: { categoryId } } } : {}),
        ...(categoryName ? { services: { some: { OR: [{ categoryId: categoryName }, { category: { name: { equals: categoryName, mode: "insensitive" } } }] } } } : {}),
      },
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: 50,
      select: {
        id: true, bio: true, experienceYears: true, startingPrice: true, serviceArea: true, rating: true, reviewCount: true,
        user: { select: { name: true, city: true, area: true } },
        services: { select: { category: { select: { id: true, name: true, icon: true } } } },
      },
    });
    return NextResponse.json({ ok: true, providers });
  } catch (error) {
    console.error("Provider directory error:", error);
    return NextResponse.json({ ok: false, providers: [], message: "Providers अभी लोड नहीं हो सके।" }, { status: 503 });
  }
}
