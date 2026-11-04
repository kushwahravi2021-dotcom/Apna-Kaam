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
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i)
});

export async function POST(request: Request) {
  if (process.env.DEMO_MODE === "true") {
    return NextResponse.json({ ok: false, message: "Demo mode में online payment verification बंद है।" }, { status: 503 });
  }
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return NextResponse.json({ ok: false, message: "पहले login करें।" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Payment verification data गलत है।" }, { status: 400 });

  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) return NextResponse.json({ ok: false, message: "Payment अभी configure नहीं है।" }, { status: 503 });
  const data = parsed.data;
  const expected = createHmac("sha256", secret).update(data.razorpay_order_id + "|" + data.razorpay_payment_id).digest();
  const supplied = Buffer.from(data.razorpay_signature, "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ ok: false, message: "Payment signature verify नहीं हुई।" }, { status: 400 });
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { bookingId: data.bookingId, providerRef: data.razorpay_order_id, booking: { customerId: session.userId } },
      select: { id: true, amount: true, status: true }
    });
    if (!payment) return NextResponse.json({ ok: false, message: "Payment order नहीं मिला।" }, { status: 404 });
    if (payment.status === "PAID") return NextResponse.json({ ok: true, message: "Payment पहले ही verify हो चुका है।" });

    // Confirm the payment with Razorpay itself; never trust only the browser callback.
    const auth = Buffer.from(keyId + ":" + secret).toString("base64");
    const gatewayResponse = await fetch(
      "https://api.razorpay.com/v1/payments/" + encodeURIComponent(data.razorpay_payment_id),
      { headers: { Authorization: "Basic " + auth }, cache: "no-store" }
    );
    const gatewayPayment = await gatewayResponse.json().catch(() => null);
    if (!gatewayResponse.ok || !gatewayPayment) {
      console.error("Razorpay payment lookup failed:", gatewayPayment);
      return NextResponse.json({ ok: false, message: "Razorpay से payment की पुष्टि नहीं हो सकी।" }, { status: 502 });
    }
    const expectedAmount = Math.round(Number(payment.amount) * 100);
    if (
      gatewayPayment.order_id !== data.razorpay_order_id ||
      gatewayPayment.status !== "captured" ||
      gatewayPayment.currency !== "INR" ||
      gatewayPayment.amount !== expectedAmount
    ) {
      return NextResponse.json({ ok: false, message: "Payment की राशि या स्थिति booking से मेल नहीं खाती।" }, { status: 400 });
    }

    await prisma.payment.updateMany({
      where: { id: payment.id, status: { not: "PAID" }, providerRef: data.razorpay_order_id },
      data: { status: "PAID" }
    });
    return NextResponse.json({ ok: true, message: "Payment सफलतापूर्वक verify हो गया।" });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ ok: false, message: "Payment status save नहीं हो सका।" }, { status: 503 });
  }
}
