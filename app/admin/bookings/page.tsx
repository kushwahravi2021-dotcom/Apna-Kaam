"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
type Booking={id:string;description:string;scheduledAt:string;status:string;createdAt:string;category:{name:string};customer:{name:string|null;phone:string};provider:{user:{name:string|null;phone:string}};address:{city:string;area:string|null;line1:string};payment:{status:string;amount:string|number}|null};
export default function AdminBookingsPage(){
 const [items,setItems]=useState<Booking[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/bookings").then(async r=>{const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||"Admin access required");setItems(d.bookings||[])}).catch(e=>setError(e instanceof Error?e.message:"कुछ गलत हुआ")).finally(()=>setLoading(false));},[]);
 return <main className="min-h-screen bg-gray-50 p-4 pb-24"><header><Link href="/admin" className="text-sm text-green-700 underline">← Admin Panel</Link><h1 className="mt-2 text-2xl font-bold">All Bookings</h1><p className="text-sm text-gray-500">Latest 100 customer bookings</p></header>
 {loading&&<p className="mt-4 rounded-xl bg-white p-4 text-sm">Bookings लोड हो रही हैं...</p>}{error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
 {!loading&&!error&&items.length===0&&<p className="mt-4 rounded-xl bg-white p-5 text-sm text-gray-500">अभी कोई booking नहीं है।</p>}
 <section className="mt-4 space-y-3">{items.map(b=><article key={b.id} className="rounded-2xl border bg-white p-4"><div className="flex items-start justify-between gap-2"><div><h2 className="font-bold">{b.category.name}</h2><p className="text-xs text-gray-500">#{b.id.slice(-8)}</p></div><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold">{b.status.replaceAll("_"," ")}</span></div><p className="mt-2 text-sm">{b.description}</p><div className="mt-3 space-y-1 text-xs text-gray-600"><p>Customer: {b.customer.name||"—"} · {b.customer.phone}</p><p>Provider: {b.provider.user.name||"—"} · {b.provider.user.phone}</p><p>Location: {b.address.line1}, {b.address.area||""} {b.address.city}</p><p>Scheduled: {new Date(b.scheduledAt).toLocaleString("hi-IN")}</p><p>Payment: {b.payment?b.payment.status+" · ₹"+Number(b.payment.amount).toLocaleString("en-IN"):"Not created"}</p></div></article>)}</section></main>;
}
