import { NextResponse } from "next/server";
import { issueOtp, normalizePhone } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizePhone(String(body.phone ?? ""));
  if (!phone) return NextResponse.json({ ok: false, message: "Valid 10 digit mobile number required." }, { status: 400 });

  const code = issueOtp(phone);
  return NextResponse.json({
    ok: true,
    message: "OTP generated.",
    ...(process.env.NODE_ENV !== "production" ? { devOtp: code } : {}),
  });
}
