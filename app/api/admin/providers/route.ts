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

const providerSelect = {
  id: true,
  bio: true,
  experienceYears: true,
  startingPrice: true,
  serviceArea: true,
  verification: true,
  availability: true,
  createdAt: true,
  deletedAt: true,
  user: { select: { id: true, name: true, phone: true, city: true, area: true } },
  services: { select: { category: { select: { id: true, name: true, icon: true } } } },
} as const;

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, message: "Admin access required." }, { status: 403 });

  const providers = await prisma.providerProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: providerSelect,
  });
  return NextResponse.json({ ok: true, providers });
}

const actionSchema = z.object({
  providerId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "BLOCK", "UNBLOCK", "ACTIVATE", "DEACTIVATE", "DELETE", "RESTORE"]),
});

export async function PATCH(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ ok: false, message: "Admin access required." }, { status: 403 });

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid provider action." }, { status: 400 });

  const { providerId, action } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const provider = await tx.providerProfile.findUnique({
        where: { id: providerId },
        select: { id: true, userId: true, verification: true, availability: true, user: { select: { name: true, phone: true } } },
      });
      if (!provider) return { kind: "missing" as const };

      if (action === "DELETE") {
        if (provider.verification === "SUSPENDED" && provider.availability === "OFFLINE") {
          const updated = await tx.providerProfile.update({ where: { id: providerId }, data: { deletedAt: new Date(), availability: "OFFLINE" }, select: providerSelect });
          await tx.adminAction.create({ data: { adminId, action: "PROVIDER_DELETED", targetType: "ProviderProfile", targetId: providerId } });
          return { kind: "updated" as const, provider: updated };
        }
        const bookings = await tx.booking.count({ where: { providerId } });
        const reviews = await tx.review.count({ where: { providerId } });
        if (bookings > 0 || reviews > 0) {
          const updated = await tx.providerProfile.update({ where: { id: providerId }, data: { deletedAt: new Date(), availability: "OFFLINE" }, select: providerSelect });
          await tx.adminAction.create({ data: { adminId, action: "PROVIDER_DELETED", targetType: "ProviderProfile", targetId: providerId } });
          return { kind: "updated" as const, provider: updated };
        }
        const updated = await tx.providerProfile.update({ where: { id: providerId }, data: { deletedAt: new Date(), availability: "OFFLINE" }, select: providerSelect });
        await tx.adminAction.create({ data: { adminId, action: "PROVIDER_DELETED", targetType: "ProviderProfile", targetId: providerId } });
        return { kind: "updated" as const, provider: updated };
      }

      if (action === "RESTORE") {
        const updated = await tx.providerProfile.update({ where: { id: providerId }, data: { deletedAt: null, verification: "PENDING", availability: "OFFLINE" }, select: providerSelect });
        await tx.adminAction.create({ data: { adminId, action: "PROVIDER_RESTORED", targetType: "ProviderProfile", targetId: providerId } });
        return { kind: "updated" as const, provider: updated };
      }

      if (provider.deletedAt) return { kind: "invalid" as const, message: "पहले provider को restore करें।" };
      let verification = provider.verification;
      let availability = provider.availability;
      let auditAction = "";

      if (action === "APPROVE") {
        if (verification !== "PENDING" && verification !== "REJECTED") return { kind: "invalid" as const, message: "केवल pending provider को approve किया जा सकता है।" };
        verification = "APPROVED";
        auditAction = "PROVIDER_APPROVED";
      } else if (action === "REJECT") {
        if (verification !== "PENDING") return { kind: "invalid" as const, message: "केवल pending provider को reject किया जा सकता है।" };
        verification = "REJECTED";
        availability = "OFFLINE";
        auditAction = "PROVIDER_REJECTED";
      } else if (action === "BLOCK") {
        verification = "SUSPENDED";
        availability = "OFFLINE";
        auditAction = "PROVIDER_BLOCKED";
      } else if (action === "UNBLOCK") {
        verification = "APPROVED";
        availability = "OFFLINE";
        auditAction = "PROVIDER_UNBLOCKED";
      } else if (action === "ACTIVATE") {
        if (verification !== "APPROVED") return { kind: "invalid" as const, message: "पहले provider को approve/unblock करें।" };
        availability = "AVAILABLE";
        auditAction = "PROVIDER_ACTIVATED";
      } else if (action === "DEACTIVATE") {
        availability = "OFFLINE";
        auditAction = "PROVIDER_DEACTIVATED";
      }

      const updated = await tx.providerProfile.update({
        where: { id: providerId },
        data: { verification, availability },
        select: providerSelect,
      });

      await tx.adminAction.create({
        data: { adminId, action: auditAction, targetType: "ProviderProfile", targetId: providerId },
      });

      if (action === "APPROVE" || action === "REJECT" || action === "BLOCK" || action === "UNBLOCK") {
        await tx.notification.create({
          data: {
            userId: provider.userId,
            title: action === "APPROVE" ? "Provider profile approved" : action === "BLOCK" ? "Provider account blocked" : action === "UNBLOCK" ? "Provider account unblocked" : "Provider application update",
            body:
              action === "APPROVE"
                ? "आपकी provider profile approve हो गई है।"
                : action === "BLOCK"
                  ? "आपका provider account admin द्वारा block कर दिया गया है।"
                  : action === "UNBLOCK"
                    ? "आपका provider account फिर से active किया जा सकता है।"
                    : "आपकी provider application approve नहीं हुई। कृपया support से संपर्क करें।",
          },
        });
      }

      return { kind: "updated" as const, provider: updated };
    });

    if (result.kind === "missing") return NextResponse.json({ ok: false, message: "Provider नहीं मिला।" }, { status: 404 });
    if (result.kind === "protected") return NextResponse.json({ ok: false, message: "इस provider के bookings/reviews मौजूद हैं, इसलिए अभी hard delete नहीं किया जा सकता। पहले account deactivate/block करें।" }, { status: 409 });
    if (result.kind === "invalid") return NextResponse.json({ ok: false, message: result.message }, { status: 409 });
    if (result.kind === "deleted") return NextResponse.json({ ok: true, message: "Provider delete हो गया।" });
    return NextResponse.json({ ok: true, message: "Provider status update हो गया।", provider: result.provider });
  } catch (error) {
    console.error("Admin provider action error:", error);
    return NextResponse.json({ ok: false, message: "Admin action save नहीं हो सका।" }, { status: 503 });
  }
}
