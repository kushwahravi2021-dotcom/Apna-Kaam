"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminSettings() {
  const [user, setUser] = useState<{name:string|null;phone:string;city:string|null;area:string|null}|null>(null);
  const [form, setForm] = useState({name:"",city:"",area:""});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile").then(async r => {
      const d = await r.json();
      if (!r.ok || !d.ok || d.user?.role !== "ADMIN") { window.location.replace("/login"); return; }
      setUser(d.user); setForm({name:d.user.name||"",city:d.user.city||"",area:d.user.area||""});
    }).catch(() => setError("Settings load नहीं हुई।"));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage(""); setError("");
    try {
      const r = await fetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.message || "Save नहीं हुआ");
      setUser(d.user); setMessage("Admin settings save हो गईं।");
    } catch(e) { setError(e instanceof Error ? e.message : "Save नहीं हुआ"); }
    finally { setSaving(false); }
  }

  const input="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm";
  return <main className="min-h-screen bg-gray-50 p-5 pb-24"><div className="mx-auto max-w-xl">
    <header className="flex items-center justify-between"><div><h1 className="text-2xl font-black">Admin Settings</h1><p className="text-sm text-gray-500">Admin account settings</p></div><Link href="/admin" className="rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white">Dashboard</Link></header>
    <form onSubmit={save} className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <div><label className="text-sm font-semibold">Name</label><input className={input} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
      <div><label className="text-sm font-semibold">City</label><input className={input} value={form.city} onChange={e=>setForm({...form,city:e.target.value})} /></div>
      <div><label className="text-sm font-semibold">Area</label><input className={input} value={form.area} onChange={e=>setForm({...form,area:e.target.value})} /></div>
      <div><label className="text-sm font-semibold">Mobile</label><input disabled className={input+" bg-gray-50"} value={user?.phone||""} /></div>
      <button disabled={saving} className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white disabled:opacity-60">{saving?"Saving...":"Save Settings"}</button>
      {message&&<p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error&&<p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </form>
  </div></main>;
}
