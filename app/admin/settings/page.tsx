"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminSettings() {
  const [user, setUser] = useState<{name:string|null;phone:string;city:string|null;area:string|null;avatarUrl:string|null}|null>(null);
  const [form, setForm] = useState({name:"",city:"",area:""});
  const [saving, setSaving] = useState(false);\n  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile").then(async r => {
      const d = await r.json();
      if (!r.ok || !d.ok || d.user?.role !== "ADMIN") { window.location.replace("/login"); return; }
      setUser(d.user); setForm({name:d.user.name||"",city:d.user.city||"",area:d.user.area||""});
    }).catch(() => setError("Settings load नहीं हुई।"));
  }, []);

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file=e.target.files?.[0]; e.target.value=""; if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setError("JPG, PNG या WEBP photo चुनें।");return;}
    if(file.size>1024*1024){setError("Photo 1 MB तक रखें।");return;}
    setUploading(true);setError("");
    try{
      const reader=new FileReader();
      const dataUrl=await new Promise<string>((resolve,reject)=>{reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file)});
      const r=await fetch("/api/provider/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"photo",mimeType:file.type,dataUrl})});
      const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||"Photo change नहीं हुई");
      setUser(u=>u?{...u,avatarUrl:d.url}:u);setMessage("Admin photo change हो गई।");
    }catch(e){setError(e instanceof Error?e.message:"Photo change नहीं हुई")}finally{setUploading(false)}
  }

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
    <header className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="relative h-16 w-16"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-2xl">{user?.avatarUrl?<img src={user.avatarUrl} alt="Admin" className="h-full w-full object-cover"/>:"👤"}</div><label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-orange-500 text-white shadow"><span className="text-sm">✎</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadPhoto} disabled={uploading}/></label></div><div><h1 className="text-2xl font-black">Admin Settings</h1><p className="text-sm text-gray-500">Photo बदलने के लिए ✎ दबाएँ</p></div></div><Link href="/admin" className="rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white">Dashboard</Link></header>
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
