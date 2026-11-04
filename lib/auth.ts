import crypto from "crypto";

const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_COOKIE = "apna_kaam_session";

type OtpRecord = { code: string; expiresAt: number };
export type SessionPayload = { userId: string; role: "CUSTOMER" | "PROVIDER" | "ADMIN"; exp: number };
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

function sessionSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters.");
  return secret;
}

export function createSessionToken(user: { id: string; role: SessionPayload["role"] }) {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", sessionSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function readSessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, suppliedSignature, extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra) return null;
  try {
    const expected = crypto.createHmac("sha256", sessionSecret()).update(encoded).digest();
    const supplied = Buffer.from(suppliedSignature, "base64url");
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || !["CUSTOMER", "PROVIDER", "ADMIN"].includes(payload.role) || !Number.isInteger(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieName = SESSION_COOKIE;
export const sessionMaxAge = SESSION_TTL_SECONDS;
