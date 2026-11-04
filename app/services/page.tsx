"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
type Service={id:string;name:string;icon:string|null;groupName:string};
export default function ServicesPage(){
 const [services,setServices]=useState<Service[]>([]);const [query,setQuery]=useState("");const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/services").then(async r=>{const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||"Services लोड नहीं हुईं");setServices(d.services||[])}).catch(e=>setError(e instanceof Error?e.message:"Services लोड नहीं हुईं")).finally(()=>setLoading(false));},[]);
 const groups=Array.from(new Set(services.map(s=>s.groupName)));
 const filtered=services.filter(s=>s.name.toLowerCase().includes(query.toLowerCase()));
 return <main className="min-h-screen bg-gray-50 pb-24"><header className="sticky top-0 z-10 border-b bg-white px-4 py-4"><h1 className="text-xl font-bold">Services</h1><div className="mt-3 flex items-center gap-2 rounded-xl border bg-gray-50 px-3 py-3"><Search size={18} className="text-gray-400"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Service खोजें..."/></div></header>
 <section className="space-y-5 p-4">{loading&&<p className="rounded-xl bg-white p-4 text-sm text-gray-500">Services लोड हो रही हैं...</p>}{error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{!loading&&!error&&filtered.length===0&&<p className="rounded-xl bg-white p-5 text-sm text-gray-500">कोई service नहीं मिली।</p>}
 {groups.map(group=><div key={group}><h2 className="mb-3 font-bold">{group}</h2><div className="space-y-2">{filtered.filter(s=>s.groupName===group).map(s=><Link key={s.id} href={"/providers?service="+encodeURIComponent(s.id)} className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="text-2xl">{s.icon||"🛠️"}</span><span className="font-medium">{s.name}</span></div><span className="text-gray-400">›</span></Link>)}</div></div>)}
 </section></main>;
}
