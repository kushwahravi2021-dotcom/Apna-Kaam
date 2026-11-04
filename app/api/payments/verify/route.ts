import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";
const schema = z.object({
  bookingId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});
export async function POST(request: Request) {
  if (process.env.DEMO_MODE === "true") return NextResponse.json({ ok: false, message: "Demo mode में online payment verification बंद है।" }, { status: 503 });
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Payment verification data गलत है।" }, { status: 400 });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ ok: false, message: "Payment अभी configure नहीं है।" }, { status: 503 });
  const data = parsed.data;
  const expected = createHmac("sha256", secret).update(data.razorpay_order_id + "|" + data.razorpay_payment_id).digest("hex");
  const supplied = Buffer.from(data.razorpay_signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (supplied.length !== expectedBuffer.length || !timingSafeEqual(supplied, expectedBuffer)) {
    return NextResponse.json({ ok: false, message: "Payment signature verify नहीं हुई।" }, { status: 400 });
  }
  try {
    const payment = await prisma.payment.findFirst({
      where: { bookingId: data.bookingId, providerRef: data.razorpay_order_id, booking: { customerId: session.userId } },
      select: { id: true, status: true }
    });
    if (!payment) return NextResponse.json({ ok: false, message: "Payment order नहीं मिला।" }, { status: 404 });
    if (payment.status === "PAID") return NextResponse.json({ ok: true, message: "Payment पहले ही verify हो चुका है।" });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", providerRef: data.razorpay_payment_id }
    });
    return NextResponse.json({ ok: true, message: "Payment सफलतापूर्वक verify हो गया।" });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ ok: false, message: "Payment status save नहीं हो सका।" }, { status: 503 });
  }
}
