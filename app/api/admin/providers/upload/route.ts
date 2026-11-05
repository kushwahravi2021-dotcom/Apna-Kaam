import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";

const LIMITS = { photo: 1024 * 1024, document: 4 * 1024 * 1024 };

async function requireAdmin() {
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  return user?.role === "ADMIN" ? session.userId : null;
}

export async function POST(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, message: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as { providerId?: string; kind?: "photo" | "document"; mimeType?: string; dataUrl?: string } | null;
  if (!body?.providerId || !body.kind || !body.dataUrl || !body.mimeType) return NextResponse.json({ ok: false, message: "File details required." }, { status: 400 });
  const allowed = body.kind === "photo" ? ["image/jpeg","image/png","image/webp"] : ["image/jpeg","image/png","application/pdf"];
  if (!allowed.includes(body.mimeType)) return NextResponse.json({ ok: false, message: "यह file format supported नहीं है।" }, { status: 400 });
  const match = body.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || match[1] !== body.mimeType) return NextResponse.json({ ok: false, message: "Invalid file data." }, { status: 400 });
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > LIMITS[body.kind]) return NextResponse.json({ ok: false, message: "File size limit से बड़ी है।" }, { status: 400 });
  const dataUrl = "data:" + body.mimeType + ";base64," + bytes.toString("base64");
  const provider = await prisma.providerProfile.findUnique({ where: { id: body.providerId }, select: { id: true } });
  if (!provider) return NextResponse.json({ ok: false, message: "Provider नहीं मिला।" }, { status: 404 });
  if (body.kind === "photo") await prisma.providerProfile.update({ where: { id: body.providerId }, data: { user: { update: { avatarUrl: dataUrl } } } });
  else await prisma.providerProfile.update({ where: { id: body.providerId }, data: { verificationDocumentUrl: dataUrl } });
  await prisma.adminAction.create({ data: { adminId, action: body.kind === "photo" ? "PROVIDER_PHOTO_EDITED" : "PROVIDER_DOCUMENT_EDITED", targetType: "ProviderProfile", targetId: body.providerId } });
  return NextResponse.json({ ok: true, url: dataUrl });
}
