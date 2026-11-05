"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ApnaKaamLogo from "@/components/ApnaKaamLogo";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

type Role = "customer" | "provider" | "admin";
type ApiResponse = { ok?: boolean; message?: string; devOtp?: string; role?: string; providerReady?: boolean };

async function readApiResponse(response: Response): Promise<ApiResponse> {
  const body = await response.text();
  if (!body.trim()) throw new Error(`Server ने empty response दिया (HTTP ${response.status})। कृपया फिर से कोशिश करें।`);
  try { return JSON.parse(body) as ApiResponse; }
  catch { throw new Error(`Server response invalid है (HTTP ${response.status})। कृपया page refresh करके फिर कोशिश करें।`); }
}

const roleCopy: Record<Role, { title: string; subtitle: string; button: string }> = {
  customer: { title: "Customer Login / Register", subtitle: "Service खोजें, booking करें और provider को track करें", button: "Customer के रूप में आगे बढ़ें" },
  provider: { title: "Provider Login / Register", subtitle: "अपनी service profile बनाएं, jobs पाएं और booking manage करें", button: "Provider के रूप में आगे बढ़ें" },
  admin: { title: "Admin Login", subtitle: "Users, providers, bookings, payments और reports manage करें", button: "Admin Panel में जाएं" },
};

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [role, setRole] = useState<Role>("customer");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function sendOtp(e: FormEvent) {
    e.preventDefault(); setError(""); setNotice("");
    if (!/^\d{10}$/.test(phone)) { setError("10 अंकों का सही मोबाइल नंबर डालें।"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, role }) });
      const d = await readApiResponse(r);
      if (!r.ok || !d.ok) throw new Error(d.message || "OTP नहीं भेजा गया");
      setStep("otp"); setNotice(d.devOtp ? "Demo OTP: " + d.devOtp : "OTP भेज दिया गया।");
    } catch (e) { setError(e instanceof Error ? e.message : "कुछ गलत हुआ"); }
    finally { setLoading(false); }
  }

  async function verify(e: FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const r = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code: otp, role }) });
      const d = await readApiResponse(r);
      if (!r.ok || !d.ok) throw new Error(d.message || "OTP verify नहीं हुआ");
      if (d.role === "ADMIN") router.replace("/admin");
      else if (d.role === "PROVIDER") router.replace(d.providerReady ? "/provider/dashboard" : "/provider");
      else router.replace("/");
    } catch (e) { setError(e instanceof Error ? e.message : "कुछ गलत हुआ"); }
    finally { setLoading(false); }
  }

  const copy = roleCopy[role];

  return (
    <main className="ak-mobile-shell min-h-screen bg-white px-4 pb-10 pt-5">
      <div className="flex justify-end"><LanguageToggle /></div>
      <div className="flex justify-center pt-5"><ApnaKaamLogo /></div>
      <div className="mt-7 grid grid-cols-3 overflow-hidden rounded-2xl border bg-slate-50 p-1">
        {([["customer", "Customer"], ["provider", "Provider"], ["admin", "Admin"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setRole(id); setStep("phone"); setOtp(""); setError(""); setNotice(""); }} className={`rounded-xl py-2.5 text-xs font-bold ${role === id ? "ak-orange text-white shadow" : "text-slate-600"}`}>{label}</button>
        ))}
      </div>
      <div className="mt-7 text-center"><p className="text-xs font-black uppercase tracking-wider text-[#ff6500]">{language === "hi" ? "अलग role, अलग dashboard" : "Separate role, separate dashboard"}</p><h1 className="mt-1 text-2xl font-black">{copy.title}</h1><p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p></div>
      {step === "phone" ? (
        <form onSubmit={sendOtp} className="mt-6">
          <label className="text-sm font-bold">Mobile Number</label>
          <div className="mt-2 flex rounded-2xl border px-3 py-3"><span className="border-r pr-3 text-sm">🇮🇳 +91</span><input className="min-w-0 flex-1 pl-3 outline-none" inputMode="numeric" maxLength={10} placeholder="98765 43210" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} /></div>
          <button disabled={loading} className="ak-orange mt-4 w-full rounded-2xl py-3.5 font-black text-white shadow-lg shadow-orange-200">{loading ? "Sending..." : copy.button}</button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6">
          <label className="text-sm font-bold">OTP</label>
          <input autoFocus className="mt-2 w-full rounded-2xl border px-4 py-4 text-center text-xl tracking-[.45em] outline-none" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" />
          <button disabled={loading} className="ak-orange mt-4 w-full rounded-2xl py-3.5 font-black text-white">{loading ? "Verifying..." : `Verify & Open ${role === "customer" ? "Customer App" : role === "provider" ? "Provider App" : "Admin Panel"}`}</button>
          <button type="button" onClick={() => setStep("phone")} className="mt-3 w-full text-sm font-bold text-[#ff6500]">Change mobile number</button>
        </form>
      )}
      {notice && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <p className="mt-6 text-center text-[11px] text-slate-400">By continuing you agree to our <Link href="/terms" className="font-bold underline">Terms & Conditions</Link> and <Link href="/privacy" className="font-bold underline">Privacy Policy</Link>.</p>
      <Link href="/" className="mt-6 block text-center text-sm font-bold text-[#ff6500]">← Home</Link>
    </main>
  );
}
