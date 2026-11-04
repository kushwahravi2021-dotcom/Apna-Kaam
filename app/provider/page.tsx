"use client";
import { FormEvent, useEffect, useState } from "react";
type Service = { id: string; name: string; icon: string | null };
export default function ProviderPage() {
  const [services,setServices]=useState<Service[]>([]);
  const [selected,setSelected]=useState<string[]>([]);
  const [form,setForm]=useState({name:"",city:"",area:"",bio:"",experienceYears:"0",startingPrice:""});
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{fetch("/api/services").then(async r=>{const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||"Services लोड नहीं हुईं");setServices(d.services||[])}).catch(e=>setError(e.message)).finally(()=>setBusy(false));},[]);
  function change(k:keyof typeof form,v:string){setForm(old=>({...old,[k]:v}));}
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");setMessage("");if(!selected.length){setError("कम से कम एक service चुनें।");return;}setBusy(true);try{const r=await fetch("/api/provider/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,experienceYears:Number(form.experienceYears),startingPrice:Number(form.startingPrice),categoryIds:selected})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||"Registration नहीं हुआ");setMessage(d.message||"Registration submit हो गया।");}catch(e){setError(e instanceof Error?e.message:"कुछ गलत हुआ");}finally{setBusy(false);}}
  const input="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm";
  return <main className="min-h-screen bg-gray-50 p-5 pb-24"><div className="mx-auto max-w-xl"><h1 className="text-2xl font-bold">सेवा देने वाले बनें</h1><p className="mt-2 text-sm text-gray-600">जानकारी भरें। Admin approval के बाद आपकी profile customers को दिखाई जाएगी।</p><p className="mt-2 text-sm"><a href="/provider/dashboard" className="font-semibold text-green-700 underline">Provider Dashboard खोलें →</a></p><form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
  <div><label className="text-sm font-semibold">पूरा नाम</label><input required minLength={2} maxLength={80} className={input} value={form.name} onChange={e=>change("name",e.target.value)}/></div>
  <div className="grid gap-3 sm:grid-cols-2"><div><label className="text-sm font-semibold">शहर</label><input required className={input} value={form.city} onChange={e=>change("city",e.target.value)}/></div><div><label className="text-sm font-semibold">इलाका</label><input required className={input} value={form.area} onChange={e=>change("area",e.target.value)}/></div></div>
  <div><label className="text-sm font-semibold">अनुभव (साल)</label><input required type="number" min="0" max="60" className={input} value={form.experienceYears} onChange={e=>change("experienceYears",e.target.value)}/></div>
  <div><label className="text-sm font-semibold">शुरुआती फीस (₹)</label><input required type="number" min="1" max="1000000" className={input} value={form.startingPrice} onChange={e=>change("startingPrice",e.target.value)}/></div>
  <div><label className="text-sm font-semibold">काम का विवरण (वैकल्पिक)</label><textarea maxLength={500} rows={3} className={input} value={form.bio} onChange={e=>change("bio",e.target.value)}/></div>
  <fieldset><legend className="text-sm font-semibold">आप कौन-सी services देते हैं?</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{services.map(s=><label key={s.id} className="flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" checked={selected.includes(s.id)} onChange={()=>setSelected(old=>old.includes(s.id)?old.filter(x=>x!==s.id):[...old,s.id])}/>{s.icon||"🛠️"} {s.name}</label>)}</div></fieldset>
  <button disabled={busy} className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-60">{busy?"Submit हो रहा है...":"Registration Submit करें"}</button>{message&&<p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}{error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </form></div></main>;
}