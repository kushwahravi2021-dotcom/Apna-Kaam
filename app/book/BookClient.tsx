"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Provider = { id: string; startingPrice: string | number | null; user: { name: string | null; city: string | null }; services: { category: { id: string; name: string } }[] };
export default function BookPage() {
  const params = useSearchParams();
  const router = useRouter();
  const providerId = params.get("providerId") || "";
  const categoryId = params.get("categoryId") || "";
  const [provider, setProvider] = useState<Provider | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState<{label:string;line1:string;city:string;area:string;latitude:number|null;longitude:number|null}>({label:"Home",line1:"",city:"",area:"",latitude:null,longitude:null});
  const [geoMessage,setGeoMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!providerId || !categoryId) { setError("Provider या service नहीं चुनी गई।"); setLoading(false); return; }
    fetch("/api/providers?categoryId=" + encodeURIComponent(categoryId))
      .then(async r => { const d=await r.json(); if(!r.ok||!d.ok) throw new Error(d.message||"Provider नहीं मिला"); const found=(d.providers||[]).find((p:Provider)=>p.id===providerId); if(!found) throw new Error("यह provider अभी उपलब्ध नहीं है।"); setProvider(found); })
      .catch(e=>setError(e instanceof Error?e.message:"Provider लोड नहीं हुआ"))
      .finally(()=>setLoading(false));
  },[providerId,categoryId]);
  function useCurrentLocation() {
    setGeoMessage("");
    if (!navigator.geolocation) { setGeoMessage("इस device पर location सुविधा उपलब्ध नहीं है।"); return; }
    navigator.geolocation.getCurrentPosition(
      position => { setAddress(old => ({...old,latitude:position.coords.latitude,longitude:position.coords.longitude})); setGeoMessage("Location जुड़ गई। पूरा पता भी भरें।"); },
      () => setGeoMessage("Location नहीं मिल सकी। Browser में location permission दें।"),
      { enableHighAccuracy:true, timeout:10000, maximumAge:60000 }
    );
  }
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const r=await fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerId,categoryId,description,scheduledAt:new Date(scheduledAt).toISOString(),address})});
      const d=await r.json(); if(!r.ok||!d.ok) throw new Error(d.message||"Booking नहीं हो सकी");
      router.push("/bookings");
    } catch(e) { setError(e instanceof Error?e.message:"Booking submit नहीं हुई"); } finally { setSaving(false); }
  }
  const input="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm";
  return <main className="min-h-screen bg-gray-50 p-4 pb-24"><div className="mx-auto max-w-xl"><Link href="/providers" className="text-sm text-green-700">← Providers पर वापस</Link><h1 className="mt-3 text-2xl font-bold">Service Book करें</h1>
    {loading && <p className="mt-4 rounded-xl bg-white p-4 text-sm">Provider details लोड हो रही हैं...</p>}
    {provider && <form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-green-50 p-3"><p className="font-semibold">{provider.user.name || "Service Provider"}</p><p className="text-sm text-gray-600">{provider.services.find(s=>s.category.id===categoryId)?.category.name} · {provider.user.city || ""}</p><p className="mt-1 text-sm">शुरुआती फीस: {provider.startingPrice==null?"तय होगी":"₹"+Number(provider.startingPrice).toLocaleString("en-IN")}</p></div>
      <div><label className="text-sm font-semibold">काम कब करवाना है?</label><input required type="datetime-local" className={input} value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} /></div>
      <div><label className="text-sm font-semibold">काम का विवरण</label><textarea required minLength={5} maxLength={1000} rows={3} className={input} placeholder="समस्या या काम के बारे में बताएं" value={description} onChange={e=>setDescription(e.target.value)} /></div>
      <div><label className="text-sm font-semibold">Address label</label><input required className={input} value={address.label} onChange={e=>setAddress({...address,label:e.target.value})}/></div>
      <div><label className="text-sm font-semibold">पूरा पता</label><textarea required minLength={5} rows={2} className={input} value={address.line1} onChange={e=>setAddress({...address,line1:e.target.value})}/></div><div><button type="button" onClick={useCurrentLocation} className="rounded-xl border border-green-200 px-3 py-2 text-xs font-semibold text-green-700">मेरी current location जोड़ें</button>{geoMessage&&<p className="mt-1 text-xs text-gray-500">{geoMessage}</p>}</div>
      <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-semibold">शहर</label><input required className={input} value={address.city} onChange={e=>setAddress({...address,city:e.target.value})}/></div><div><label className="text-sm font-semibold">इलाका</label><input className={input} value={address.area} onChange={e=>setAddress({...address,area:e.target.value})}/></div></div>
      <p className="text-xs text-gray-500">Booking कम से कम 30 मिनट आगे के समय के लिए करें। Provider request स्वीकार या अस्वीकार कर सकता है।</p>
      <button disabled={saving} className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-60">{saving?"Booking भेजी जा रही है...":"Booking Confirm करें"}</button>
    </form>}
    {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}<p className="mt-2"><Link href="/login" className="font-semibold underline">Login करें</Link></p></div>}
  </div></main>;
}
