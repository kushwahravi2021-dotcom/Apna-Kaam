import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readSessionToken, sessionCookieName } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LIMITS = { photo: 1024 * 1024, document: 4 * 1024 * 1024 };

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true, providerProfile: { select: { id: true } } } });
  if (!user || user.role !== "PROVIDER" || !user.providerProfile) return NextResponse.json({ ok: false, message: "Provider access required." }, { status: 403 });

  const body = await request.json().catch(() => null) as { kind?: "photo" | "document"; mimeType?: string; dataUrl?: string } | null;
  if (!body?.kind || !body.dataUrl || !body.mimeType) return NextResponse.json({ ok: false, message: "File select करें।" }, { status: 400 });
  if (body.kind !== "photo" && body.kind !== "document") return NextResponse.json({ ok: false, message: "Invalid file type." }, { status: 400 });
  const allowed = body.kind === "photo" ? ["image/jpeg", "image/png", "image/webp"] : ["image/jpeg", "image/png", "application/pdf"];
  if (!allowed.includes(body.mimeType)) return NextResponse.json({ ok: false, message: "यह file format supported नहीं है।" }, { status: 400 });
  const match = body.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || match[1] !== body.mimeType) return NextResponse.json({ ok: false, message: "Invalid file data." }, { status: 400 });
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > LIMITS[body.kind]) return NextResponse.json({ ok: false, message: body.kind === "photo" ? "Photo 1 MB तक रखें।" : "Document 4 MB तक रखें।" }, { status: 400 });

  const dataUrl = "data:" + body.mimeType + ";base64," + bytes.toString("base64");
  if (body.kind === "photo") {
    await prisma.user.update({ where: { id: session.userId }, data: { avatarUrl: dataUrl } });
  } else {
    await prisma.providerProfile.update({ where: { userId: session.userId }, data: { verificationDocumentUrl: dataUrl } });
  }
  return NextResponse.json({ ok: true, url: dataUrl });
}
