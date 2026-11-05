"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Service = { id: string; name: string; icon: string | null };

export default function ProviderPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "", city: "Ganj Basoda", area: "", bio: "", experienceYears: "0", startingPrice: "",
    avatarUrl: "", verificationDocumentUrl: "", upiId: "", bankAccountName: "", bankAccountNumber: "", bankIfsc: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/services").then(async r => {
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.message || "Services लोड नहीं हुईं");
      setServices(d.services || []);
    }).catch(e => setError(e instanceof Error ? e.message : "Services load नहीं हुईं"));
  }, []);

  function change(k: keyof typeof form, v: string) { setForm(old => ({ ...old, [k]: v })); }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setMessage("");
    if (!selected.length) { setError("कम से कम एक service चुनें।"); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/provider/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, experienceYears: Number(form.experienceYears), startingPrice: Number(form.startingPrice), categoryIds: selected }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.message || "Registration नहीं हुआ");
      setMessage(d.message || "Registration submit हो गया।");
    } catch (e) { setError(e instanceof Error ? e.message : "कुछ गलत हुआ"); }
    finally { setBusy(false); }
  }

  const input = "mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm";
  return <main className="min-h-screen bg-gray-50 p-5 pb-24">
    <div className="mx-auto max-w-xl">
      <header className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Provider Profile</h1><p className="mt-1 text-sm text-gray-600">अपनी पूरी service profile बनाएं। Admin approval के बाद customers को दिखाई जाएगी।</p></div>
        <Link href="/provider/dashboard" className="rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white">Dashboard</Link>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl bg-white p-5 shadow-sm">
        <section><h2 className="font-black">Basic Details</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="text-sm font-semibold">नाम</label><input required minLength={2} maxLength={80} className={input} value={form.name} onChange={e => change("name", e.target.value)} /></div>
            <div><label className="text-sm font-semibold">Mobile number</label><input disabled className={input + " bg-gray-50"} value="Login mobile number" /></div>
            <div><label className="text-sm font-semibold">Photo URL</label><input className={input} placeholder="https://..." value={form.avatarUrl} onChange={e => change("avatarUrl", e.target.value)} /></div>
            <div><label className="text-sm font-semibold">शहर</label><input required className={input} value={form.city} onChange={e => change("city", e.target.value)} /></div>
            <div><label className="text-sm font-semibold">Service area</label><input required className={input} value={form.area} onChange={e => change("area", e.target.value)} /></div>
          </div>
        </section>

        <section><h2 className="font-black">Service Details</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><label className="text-sm font-semibold">Experience (years)</label><input required type="number" min="0" max="60" className={input} value={form.experienceYears} onChange={e => change("experienceYears", e.target.value)} /></div>
            <div><label className="text-sm font-semibold">Charges / starting price (₹)</label><input required type="number" min="1" max="1000000" className={input} value={form.startingPrice} onChange={e => change("startingPrice", e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="text-sm font-semibold">काम का विवरण</label><textarea maxLength={500} rows={3} className={input} value={form.bio} onChange={e => change("bio", e.target.value)} /></div>
          </div>
          <fieldset className="mt-4"><legend className="text-sm font-semibold">आप कौन-सी services देते हैं?</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{services.map(s => <label key={s.id} className="flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" checked={selected.includes(s.id)} onChange={() => setSelected(old => old.includes(s.id) ? old.filter(x => x !== s.id) : [...old, s.id])} />{s.icon || "🛠️"} {s.name}</label>)}</div></fieldset>
        </section>

        <section><h2 className="font-black">Verification & Payment</h2>
          <p className="mt-1 text-xs text-gray-500">Documents admin verification के लिए हैं। Bank/UPI details payout setup के लिए रखी जाएंगी।</p>
          <div className="mt-3 grid gap-3">
            <div><label className="text-sm font-semibold">Document / ID proof URL</label><input className={input} placeholder="https://..." value={form.verificationDocumentUrl} onChange={e => change("verificationDocumentUrl", e.target.value)} /></div>
            <div><label className="text-sm font-semibold">UPI ID</label><input className={input} placeholder="name@upi" value={form.upiId} onChange={e => change("upiId", e.target.value)} /></div>
            <div className="grid gap-3 sm:grid-cols-2"><div><label className="text-sm font-semibold">Bank account name</label><input className={input} value={form.bankAccountName} onChange={e => change("bankAccountName", e.target.value)} /></div><div><label className="text-sm font-semibold">IFSC</label><input className={input} value={form.bankIfsc} onChange={e => change("bankIfsc", e.target.value)} /></div></div>
            <div><label className="text-sm font-semibold">Bank account number</label><input className={input} value={form.bankAccountNumber} onChange={e => change("bankAccountNumber", e.target.value)} /></div>
          </div>
        </section>

        <button disabled={busy} className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Submit हो रहा है..." : "Provider Registration Submit करें"}</button>
        {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </form>
    </div>
  </main>;
}