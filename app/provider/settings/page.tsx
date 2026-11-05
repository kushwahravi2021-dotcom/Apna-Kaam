"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

export default function ProviderSettings() {
  const [form, setForm] = useState({ upiId: "", bankAccountName: "", bankAccountNumber: "", bankIfsc: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile").then(async r => { const d = await r.json(); if (!r.ok || !d.ok || d.user?.role !== "PROVIDER") { window.location.replace("/login"); return; }
      return fetch("/api/provider/payment");
    }).then(async r => { if (!r) return; const d = await r.json(); if (!r.ok || !d.ok) throw new Error(d.message || "Settings load नहीं हुईं"); setForm({ upiId: d.payment?.upiId || "", bankAccountName: d.payment?.bankAccountName || "", bankAccountNumber: d.payment?.bankAccountNumber || "", bankIfsc: d.payment?.bankIfsc || "" }); }).catch(e => setError(e instanceof Error ? e.message : "Settings load नहीं हुईं")).finally(() => setLoading(false));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const r = await fetch("/api/provider/payment", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json(); if (!r.ok || !d.ok) throw new Error(d.message || "Save नहीं हुआ");
      setMessage("Payment details successfully save हो गईं।");
    } catch (e) { setError(e instanceof Error ? e.message : "Save नहीं हुआ"); } finally { setSaving(false); }
  }

  const input = "mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm";
  return <main className="min-h-screen bg-gray-50 p-5 pb-24"><div className="mx-auto max-w-xl">
    <header className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Provider Settings</h1><p className="mt-1 text-sm text-gray-600">Payment और account settings</p></div><Link href="/provider/dashboard" className="rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white">Dashboard</Link></header>
    {loading ? <p className="mt-6 rounded-2xl bg-white p-5">Settings load हो रही हैं...</p> : <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl bg-white p-5 shadow-sm">
      <section><h2 className="font-black">UPI Payment</h2><div className="mt-3"><label className="text-sm font-semibold">UPI ID</label><input className={input} placeholder="name@upi" value={form.upiId} onChange={e => setForm({ ...form, upiId: e.target.value })} /></div></section>
      <section><h2 className="font-black">Bank Account</h2><div className="mt-3 space-y-3">
        <div><label className="text-sm font-semibold">Account holder name</label><input className={input} value={form.bankAccountName} onChange={e => setForm({ ...form, bankAccountName: e.target.value })} /></div>
        <div><label className="text-sm font-semibold">Account number</label><input inputMode="numeric" className={input} value={form.bankAccountNumber} onChange={e => setForm({ ...form, bankAccountNumber: e.target.value })} /></div>
        <div><label className="text-sm font-semibold">IFSC</label><input className={input} value={form.bankIfsc} onChange={e => setForm({ ...form, bankIfsc: e.target.value.toUpperCase() })} /></div>
      </div></section>
      <button disabled={saving} className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Payment Details Save करें"}</button>
      {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </form>}
  </div></main>;
}
