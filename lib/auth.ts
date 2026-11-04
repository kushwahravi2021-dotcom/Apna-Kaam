import crypto from "crypto";

const OTP_TTL_MS = 5 * 60 * 1000;

type OtpRecord = { code: string; expiresAt: number };
const otpStore = new Map<string, OtpRecord>();

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  return digits.length === 10 ? `+91${digits}` : null;
}

export function issueOtp(phone: string) {
  const code = process.env.NODE_ENV === "development" ? "123456" : crypto.randomInt(100000, 1000000).toString();
  otpStore.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });
  return code;
}

export function verifyOtp(phone: string, code: string) {
  const record = otpStore.get(phone);
  if (!record || record.expiresAt < Date.now() || record.code !== code) return false;
  otpStore.delete(phone);
  return true;
}
