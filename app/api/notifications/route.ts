import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { readSessionToken, sessionCookieName } from '@/lib/auth';

async function signedInUser() {
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId }, select: { id: true } });
}
export async function GET() {
  const user = await signedInUser();
  if (!user) return NextResponse.json({ ok: false, message: 'पहले login करें।' }, { status: 401 });
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 100,
    select: { id: true, title: true, body: true, readAt: true, createdAt: true }
  });
  return NextResponse.json({ ok: true, notifications, unreadCount: notifications.filter(n => !n.readAt).length });
}
const schema = z.object({ id: z.string().min(1).optional(), all: z.boolean().optional() }).refine(v => Boolean(v.id) || v.all === true);
export async function PATCH(request: Request) {
  const user = await signedInUser();
  if (!user) return NextResponse.json({ ok: false, message: 'पहले login करें।' }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Notification चुनें।' }, { status: 400 });
  try {
    const where = parsed.data.all ? { userId: user.id, readAt: null } : { id: parsed.data.id!, userId: user.id };
    const result = await prisma.notification.updateMany({ where, data: { readAt: new Date() } });
    return NextResponse.json({ ok: true, updated: result.count });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ ok: false, message: 'Notification update नहीं हुई।' }, { status: 503 });
  }
}
