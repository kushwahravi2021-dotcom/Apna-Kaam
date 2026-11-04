import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";
const schema = z.object({ bookingId: z.string().min(1) });
export async function POST(request: Request) {
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Booking चुनें।" }, { status: 400 });
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return NextResponse.json({ ok: false, message: "Online payment अभी configure नहीं है।" }, { status: 503 });
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: parsed.data.bookingId, customerId: session.userId, status: "COMPLETED" },
      select: { id: true, provider: { select: { startingPrice: true } }, payment: { select: { id: true, status: true } } }
    });
    if (!booking) return NextResponse.json({ ok: false, message: "Completed booking नहीं मिली।" }, { status: 404 });
    if (booking.payment?.status === "PAID") return NextResponse.json({ ok: false, message: "इस booking का payment पहले हो चुका है।" }, { status: 409 });
    const amount = Math.round(Number(booking.provider.startingPrice || 0) * 100);
    if (!Number.isSafeInteger(amount) || amount < 100) return NextResponse.json({ ok: false, message: "Provider की valid service fee set नहीं है।" }, { status: 400 });
    const auth = Buffer.from(keyId + ":" + keySecret).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: "Basic " + auth, "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: "INR", receipt: booking.id.slice(0, 40), notes: { bookingId: booking.id } })
    });
    const orderData = await response.json();
    if (!response.ok || !orderData.id) {
      console.error("Razorpay order error:", orderData);
      return NextResponse.json({ ok: false, message: "Payment order नहीं बन सका।" }, { status: 502 });
    }
    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: { amount: amount / 100, status: "PENDING", providerRef: orderData.id },
      create: { bookingId: booking.id, amount: amount / 100, status: "PENDING", providerRef: orderData.id }
    });
    return NextResponse.json({ ok: true, keyId, orderId: orderData.id, amount, currency: "INR", bookingId: booking.id });
  } catch (error) {
    console.error("Payment order creation error:", error);
    return NextResponse.json({ ok: false, message: "Payment order अभी create नहीं हो सका।" }, { status: 503 });
  }
}
