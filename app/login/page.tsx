"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ApiResponse = {
  ok?: boolean;
  message?: string;
  devOtp?: string;
  user?: { id: string; phone: string; role: string; name: string | null };
};

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function sendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!/^\d{10}$/.test(phone)) {
      setError("कृपया 10 अंकों का सही मोबाइल नंबर डालें।");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.ok) throw new Error(data.message || "OTP भेजा नहीं जा सका।");
      setStep("otp");
      setNotice(data.devOtp ? `टेस्ट OTP: ${data.devOtp}` : "OTP भेजने की प्रक्रिया शुरू हुई।");
    } catch (err) {
      setError(err instanceof Error ? err.message : "कुछ गलत हुआ। दोबारा कोशिश करें।");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!/^\d{6}$/.test(otp)) {
      setError("कृपया 6 अंकों का OTP डालें।");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.ok) throw new Error(data.message || "OTP verify नहीं हुआ।");
      setNotice("मोबाइल नंबर verify हो गया।");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "कुछ गलत हुआ। दोबारा कोशिश करें।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">🏠</div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Apna Kaam</h1>
          <p className="mt-1 text-sm text-gray-500">Ghar ki har zarurat, ek hi app par.</p>
        </div>

        {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-950"><p className="font-bold">Demo provider accounts</p><p className="mt-1">Ramesh (Plumber): 9999990001</p><p>Suresh (Electrician): 9999990002</p><p>Asha (Carpenter): 9999990003</p><p className="mt-1">OTP: 123456 · Customer testing के लिए अपना कोई भी 10-digit test number इस्तेमाल करें।</p></div>}

        {step === "phone" ? (
          <form className="mt-9" onSubmit={sendOtp}>
            <label htmlFor="phone" className="text-sm font-semibold text-gray-800">Mobile Number</label>
            <div className="mt-2 flex rounded-xl border border-gray-200 px-3 focus-within:border-green-600">
              <span className="flex items-center border-r pr-3 text-sm text-gray-600">+91</span>
              <input id="phone" className="w-full px-3 py-3 outline-none" placeholder="10 digit mobile number" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} />
            </div>
            <button disabled={loading} className="mt-4 w-full rounded-xl bg-green-600 py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "भेज रहे हैं..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form className="mt-9" onSubmit={verifyOtp}>
            <p className="text-sm text-gray-600">+91 {phone} पर भेजा गया 6 अंकों का OTP डालें।</p>
            <label htmlFor="otp" className="mt-4 block text-sm font-semibold text-gray-800">OTP</label>
            <input id="otp" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:border-green-600" placeholder="••••••" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} />
            <button disabled={loading} className="mt-4 w-full rounded-xl bg-green-600 py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "जाँच रहे हैं..." : "Verify OTP"}
            </button>
            <button type="button" disabled={loading} onClick={() => { setStep("phone"); setOtp(""); setError(""); setNotice(""); }} className="mt-3 w-full py-2 text-sm font-semibold text-green-700">मोबाइल नंबर बदलें</button>
          </form>
        )}

        {notice && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <p className="mt-5 text-center text-xs text-gray-500">Demo में OTP स्क्रीन पर दिखेगा। Official launch पर असली SMS सेवा configure होगी।</p>
        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-green-700">← Home पर जाएं</Link>
      </div>
    </main>
  );
}
