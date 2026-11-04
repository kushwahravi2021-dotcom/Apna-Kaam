import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.category.findMany({
      where: { active: true },
      orderBy: [{ groupName: "asc" }, { name: "asc" }],
      select: { id: true, name: true, icon: true, groupName: true },
    });
    return NextResponse.json({ ok: true, services });
  } catch {
    return NextResponse.json(
      { ok: false, services: [], message: "Database is not configured yet." },
      { status: 503 },
    );
  }
}
