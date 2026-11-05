import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, boolean> = {
    database: false,
    authSecret: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32),
    twilioVerify: Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_VERIFY_SERVICE_SID
    ),
    razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error("Health database check failed:", error);
  }

  const readyForProduction =
    checks.database &&
    checks.authSecret &&
    checks.twilioVerify &&
    checks.appUrl &&
    process.env.DEMO_MODE !== "true";

  return NextResponse.json(
    {
      ok: readyForProduction,
      demoMode: process.env.DEMO_MODE === "true",
      checks,
      message: readyForProduction
        ? "Apna Kaam production configuration is healthy."
        : "Apna Kaam is running, but one or more production settings are still incomplete.",
    },
    { status: readyForProduction ? 200 : 503 }
  );
}
