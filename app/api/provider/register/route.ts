import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, readSessionToken, sessionCookieName, sessionMaxAge } from "@/lib/auth";

const providerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(500).optional().default(""),
  experienceYears: z.coerce.number().int().min(0).max(60),
  startingPrice: z.coerce.number().positive().max(1000000),
  avatarUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  verificationDocumentUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  upiId: z.string().trim().max(100).optional().default(""),
  bankAccountName: z.string().trim().max(120).optional().default(""),
  bankAccountNumber: z.string().trim().max(40).optional().default(""),
  bankIfsc: z.string().trim().max(20).optional().default(""),
  categoryIds: z.array(z.string().min(1)).min(1).max(12),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  const account = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true, providerProfile: { select: { verification: true, availability: true } } } });
  if (!account || account.role === "ADMIN") return NextResponse.json({ ok: false, message: "इस account से provider registration की अनुमति नहीं है।" }, { status: 403 });
  if (account.role !== "CUSTOMER" && account.role !== "PROVIDER") return NextResponse.json({ ok: false, message: "Invalid account role." }, { status: 403 });

  const parsed = providerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "कृपया सभी जरूरी जानकारी सही भरें।", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  const data = parsed.data;

  try {
    const categories = await prisma.category.findMany({ where: { id: { in: data.categoryIds }, active: true }, select: { id: true } });
    if (categories.length !== new Set(data.categoryIds).size) return NextResponse.json({ ok: false, message: "चुनी गई service category उपलब्ध नहीं है।" }, { status: 400 });

    await prisma.$transaction(async tx => {
      await tx.user.update({
        where: { id: session.userId },
        data: { name: data.name, city: data.city, area: data.area, role: "PROVIDER", avatarUrl: data.avatarUrl || null },
      });
      await tx.providerProfile.upsert({
        where: { userId: session.userId },
        update: {
          bio: data.bio, experienceYears: data.experienceYears, startingPrice: data.startingPrice, serviceArea: data.area,
          verificationDocumentUrl: data.verificationDocumentUrl || null, upiId: data.upiId || null,
          bankAccountName: data.bankAccountName || null, bankAccountNumber: data.bankAccountNumber || null, bankIfsc: data.bankIfsc || null,
          verification: account.providerProfile?.verification ?? "PENDING", availability: account.providerProfile?.availability ?? "OFFLINE",
          services: { deleteMany: {}, create: data.categoryIds.map(categoryId => ({ categoryId })) },
        },
        create: {
          userId: session.userId, bio: data.bio, experienceYears: data.experienceYears, startingPrice: data.startingPrice, serviceArea: data.area,
          verificationDocumentUrl: data.verificationDocumentUrl || null, upiId: data.upiId || null,
          bankAccountName: data.bankAccountName || null, bankAccountNumber: data.bankAccountNumber || null, bankIfsc: data.bankIfsc || null,
          verification: "PENDING", availability: "OFFLINE", services: { create: data.categoryIds.map(categoryId => ({ categoryId })) },
        },
      });
    });

    const response = NextResponse.json({ ok: true, message: "Registration submit हो गया। Admin approval के बाद आपकी profile दिखाई जाएगी।" });
    response.cookies.set(sessionCookieName, createSessionToken({ id: session.userId, role: "PROVIDER" }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: sessionMaxAge });
    return response;
  } catch (error) {
    console.error("Provider registration error:", error);
    return NextResponse.json({ ok: false, message: "Registration अभी submit नहीं हो सका।" }, { status: 503 });
  }
}