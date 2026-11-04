"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
type Notice = { id: string; title: string; body: string; readAt: string | null; createdAt: string };
export default function NotificationsPage() {
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  async function load() {
    setError('');
    try {
      const r = await fetch('/api/notifications'); const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.message || 'Notifications लोड नहीं हुईं');
      setItems(d.notifications || []);
    } catch (e) { setError(e instanceof Error ? e.message : 'कुछ गलत हुआ'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function markRead(id?: string) {
    setBusy(id || 'all'); setError('');
    try {
      const r = await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(id ? { id } : { all: true }) });
      const d = await r.json(); if (!r.ok || !d.ok) throw new Error(d.message || 'Update नहीं हुआ');
      const now = new Date().toISOString();
      setItems(old => old.map(n => (!id || n.id === id) ? { ...n, readAt: now } : n));
    } catch (e) { setError(e instanceof Error ? e.message : 'Update नहीं हुआ'); }
    finally { setBusy(''); }
  }
  const unread = items.filter(n => !n.readAt).length;
  return <main className="min-h-screen bg-gray-50 pb-24">
    <header className="flex items-center justify-between border-b bg-white px-4 py-4">
      <div><Link href="/profile" className="text-xs text-green-700">← Profile</Link><h1 className="mt-1 text-xl font-bold">Notifications</h1><p className="text-xs text-gray-500">{unread} unread</p></div>
      {unread > 0 && <button disabled={!!busy} onClick={() => markRead()} className="text-xs font-semibold text-green-700 disabled:opacity-50">सभी पढ़ें</button>}
    </header>
    <section className="space-y-2 p-4">
      {loading ? <p className="rounded-xl bg-white p-4 text-sm text-gray-500">Notifications लोड हो रही हैं...</p> : error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : items.length === 0 ? <div className="rounded-2xl bg-white p-8 text-center"><div className="text-4xl">🔔</div><p className="mt-3 font-semibold">अभी कोई notification नहीं है</p><p className="mt-1 text-sm text-gray-500">Booking updates यहाँ दिखाई देंगी।</p></div> : items.map(n => <article key={n.id} className={'rounded-2xl border bg-white p-4 ' + (!n.readAt ? 'border-green-300' : 'border-gray-100')}>
        <div className="flex items-start justify-between gap-2"><h2 className="font-semibold">{n.title}</h2>{!n.readAt && <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-800">NEW</span>}</div>
        <p className="mt-1 text-sm text-gray-600">{n.body}</p>
        <div className="mt-3 flex items-center justify-between"><time className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('hi-IN')}</time>{!n.readAt && <button disabled={!!busy} onClick={() => markRead(n.id)} className="text-xs font-semibold text-green-700">पढ़ लिया</button>}</div>
      </article>)}
    </section>
  </main>;
}
