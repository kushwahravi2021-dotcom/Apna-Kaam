"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
type User = { id: string; phone: string; role: string; name: string | null; city: string | null; area: string | null };
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", city: "", area: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/profile").then(async r => { const d = await r.json(); if (!r.ok || !d.ok) throw new Error(d.message || "Login करें"); setUser(d.user); setForm({ name: d.user.name || "", city: d.user.city || "", area: d.user.area || "" }); })
      .catch(e => setError(e instanceof Error ? e.message : "Profile लोड नहीं हुई")).finally(() => setLoading(false));
  }, []);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json(); if (!r.ok || !d.ok) throw new Error(d.message || "Save नहीं हुआ");
      setUser(d.user); setMessage("आपकी profile update हो गई।");
    } catch (e) { setError(e instanceof Error ? e.message : "Save नहीं हुआ"); }
    finally { setSaving(false); }
  }
  async function logout() {
    setError("");
    try { const r = await fetch("/api/auth/logout", { method: "POST" }); if (!r.ok) throw new Error("Logout नहीं हुआ"); window.location.href = "/login"; }
    catch (e) { setError(e instanceof Error ? e.message : "Logout नहीं हुआ"); }
  }
  const input = "mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm";
  return <main className="min-h-screen bg-gray-50 pb-24">
    <header className="bg-green-700 px-5 pb-7 pt-7 text-white"><p className="text-xs text-green-100">Apna Kaam Account</p><h1 className="mt-1 text-2xl font-bold">{user?.name || "My Profile"}</h1><p className="mt-1 text-sm text-green-100">{user?.phone || "अपना account manage करें"}</p>{user && <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs">{user.role}</span>}</header>
    <section className="space-y-3 p-4">
      {loading ? <p className="rounded-xl bg-white p-4 text-sm">Profile लोड हो रही है...</p> : user ? <form onSubmit={save} className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm"><h2 className="font-bold">Profile Details</h2><div><label className="text-sm font-medium">नाम</label><input required minLength={2} maxLength={80} className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></div><div><label className="text-sm font-medium">शहर</label><input required minLength={2} className={input} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}/></div><div><label className="text-sm font-medium">इलाका</label><input className={input} value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}/></div><button disabled={saving} className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-50">{saving ? "Save हो रहा है..." : "Profile Save करें"}</button></form> : <Link href="/login" className="block rounded-2xl bg-green-600 p-4 text-center font-semibold text-white">Login / Register</Link>}
      {message && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Link href="/notifications" className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm"><span>🔔 Notifications</span><span className="text-gray-400">›</span></Link>
      <Link href="/support" className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm"><span>🆘 Help & Support</span><span className="text-gray-400">›</span></Link>
      {user?.role === "PROVIDER" && <Link href="/provider/dashboard" className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm"><span>🧰 Provider Dashboard</span><span className="text-gray-400">›</span></Link>}
      {user?.role === "ADMIN" && <Link href="/admin" className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm"><span>⚙️ Admin Dashboard</span><span className="text-gray-400">›</span></Link>}
      {user && <button onClick={logout} className="w-full rounded-2xl border border-red-200 bg-white p-4 text-left font-semibold text-red-700">Logout</button>}
    </section>
  </main>;
}
