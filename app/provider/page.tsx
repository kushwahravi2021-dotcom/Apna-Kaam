"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Service = { id: string; name: string; icon: string | null };

export default function ProviderPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", city: "Ganj Basoda", area: "", bio: "", experienceYears: "0", startingPrice: "", avatarUrl: "", verificationDocumentUrl: "" });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<"photo" | "document" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile").then(async r => { const d = await r.json(); if (!r.ok || !d.ok || d.user?.role !== "PROVIDER") { window.location.replace("/login"); return; } }).catch(() => window.location.replace("/login"));
    fetch("/api/services").then(async r => { const d = await r.json(); if (!r.ok || !d.ok) throw new Error(d.message || "Services लोड नहीं हुईं"); setServices(d.services || []); }).catch(e => setError(e instanceof Error ? e.message : "Services load नहीं हुईं"));
  }, []);

  function change(k: keyof typeof form, v: string) { setForm(old => ({ ...old, [k]: v })); }

  async function upload(kind: "photo" | "document", e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const max = kind === "photo" ? 1024 * 1024 : 4 * 1024 * 1024;
    if (file.size > max) { setError(kind === "photo" ? "Photo 1 MB तक रखें।" : "Document 4 MB तक रखें।"); return; }
    const allowed = kind === "photo" ? ["image/jpeg", "image/png", "image/webp"] : ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) { setError(kind === "photo" ? "JPG, PNG या WEBP photo चुनें।" : "JPG, PNG या PDF document चुनें।"); return; }
    setUploading(kind); setError(""); setMessage("");
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => { reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const r = await fetch("/api/provider/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, mimeType: file.type, dataUrl }) });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.message || "Upload नहीं हुआ");
      change(kind === "photo" ? "avatarUrl" : "verificationDocumentUrl", d.url);
      setMessage(kind === "photo" ? "Profile photo upload हो गई।" : "ID proof upload हो गया।");
    } catch (e) { setError(e instanceof Error ? e.message : "Upload नहीं हुआ"); } finally { setUploading(""); }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setMessage("");
    if (!selected.length) { setError("कम से कम एक service चुनें।"); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/provider/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, experienceYears: Number(form.experienceYears), startingPrice: Number(form.startingPrice), categoryIds: selected }) });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.message || "Registration नहीं हुआ");
      setMessage(d.message || "Registration submit हो गया। Payment details बाद में Provider Settings में भर सकते हैं।");
    } catch (e) { setError(e instanceof Error ? e.message : "कुछ गलत हुआ"); } finally { setBusy(false); }
  }

  const input = "mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm";
  return <main className="min-h-screen bg-gray-50 p-5 pb-24"><div className="mx-auto max-w-xl">
    <header className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Provider Profile</h1><p className="mt-1 text-sm text-gray-600">अपनी service profile बनाएं। Admin approval के बाद customers को दिखाई जाएगी।</p></div><div className="flex gap-2"><Link href="/provider/settings" className="rounded-xl border px-3 py-2 text-xs font-bold">Settings</Link><Link href="/provider/dashboard" className="rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white">Dashboard</Link></div></header>
    <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl bg-white p-5 shadow-sm">
      <section><h2 className="font-black">Basic Details</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="text-sm font-semibold">नाम</label><input required minLength={2} maxLength={80} className={input} value={form.name} onChange={e => change("name", e.target.value)} /></div>
        <div><label className="text-sm font-semibold">Mobile number</label><input disabled className={input + " bg-gray-50"} value="Login mobile number" /></div>
        <div><label className="text-sm font-semibold">अपनी Photo</label><div className="mt-2 flex items-center gap-3"><div className="relative h-20 w-20"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-2xl">{form.avatarUrl ? <img src={form.avatarUrl} alt="Provider" className="h-full w-full object-cover" /> : "👤"}</div><label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-green-600 text-white shadow"><span className="text-sm">✎</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => upload("photo", e)} disabled={!!uploading} /></label></div><div className="text-xs text-gray-500">{uploading==="photo"?"Photo upload हो रही है...":"Photo बदलने के लिए ✎ दबाएँ"}</div></div><p className="mt-1 text-xs text-gray-500">JPG/PNG/WEBP · max 1 MB</p></div>
        <div><label className="text-sm font-semibold">शहर</label><input required className={input} value={form.city} onChange={e => change("city", e.target.value)} /></div>
        <div><label className="text-sm font-semibold">Service area</label><input required className={input} value={form.area} onChange={e => change("area", e.target.value)} /></div>
      </div></section>
      <section><h2 className="font-black">Service Details</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div><label className="text-sm font-semibold">Experience (years)</label><input required type="number" min="0" max="60" className={input} value={form.experienceYears} onChange={e => change("experienceYears", e.target.value)} /></div>
        <div><label className="text-sm font-semibold">Charges / starting price (₹)</label><input required type="number" min="1" max="1000000" className={input} value={form.startingPrice} onChange={e => change("startingPrice", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="text-sm font-semibold">काम का विवरण</label><textarea maxLength={500} rows={3} className={input} value={form.bio} onChange={e => change("bio", e.target.value)} /></div>
      </div><fieldset className="mt-4"><legend className="text-sm font-semibold">आप कौन-सी services देते हैं?</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{services.map(s => <label key={s.id} className="flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" checked={selected.includes(s.id)} onChange={() => setSelected(old => old.includes(s.id) ? old.filter(x => x !== s.id) : [...old, s.id])} />{s.icon || "🛠️"} {s.name}</label>)}</div></fieldset></section>
      <section><h2 className="font-black">Verification</h2><p className="mt-1 text-xs text-gray-500">Admin verification के लिए अपना ID proof upload करें।</p><div className="mt-3"><label className="text-sm font-semibold">Document / ID proof</label><input type="file" accept="image/jpeg,image/png,application/pdf" className={input} onChange={e => upload("document", e)} /><p className="mt-1 text-xs text-gray-500">JPG/PNG/PDF · max 4 MB</p>{form.verificationDocumentUrl && <p className="mt-2 text-xs font-semibold text-green-700">✓ ID proof upload हो गया</p>}</div></section>
      <button disabled={busy || !!uploading} className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Submit हो रहा है..." : "Provider Registration Submit करें"}</button>
      {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </form>
  </div></main>;
}
