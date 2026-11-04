import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";
async function currentUser() {
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, phone: true, role: true, name: true, city: true, area: true } });
}
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  return NextResponse.json({ ok: true, user });
}
const schema = z.object({
  name: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().max(100).optional().default("")
});
export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "नाम और शहर सही भरें।", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const updated = await prisma.$transaction(async tx => {
      const saved = await tx.user.update({ where: { id: user.id }, data: parsed.data, select: { id: true, phone: true, role: true, name: true, city: true, area: true } });
      if (saved.role === "PROVIDER") await tx.providerProfile.updateMany({ where: { userId: user.id }, data: { serviceArea: parsed.data.area } });
      return saved;
    });
    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ ok: false, message: "Profile save नहीं हो सकी।" }, { status: 503 });
  }
}
