"use client";

import Link from "next/link";
import { Bell, ChevronDown, MapPin, Search, Star, ShieldCheck } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import ApnaKaamLogo from "@/components/ApnaKaamLogo";
import { useLanguage } from "@/components/LanguageProvider";

const services = [["electrician","⚡","Electrician","इलेक्ट्रीशियन"],["plumber","🔧","Plumber","प्लंबर"],["carpenter","🪚","Carpenter","बढ़ई"],["painter","🖌️","Painter","पेंटर"],["ac-repair","❄️","AC Service","एसी सर्विस"],["cleaning","🧹","Home Cleaning","होम क्लीनिंग"],["mobile-repair","📱","Mobile Repair","मोबाइल रिपेयर"],["more","••","More","और सेवाएं"]];

const providers = [
  {name:"Rakesh Electricals",rating:"4.8",reviews:"120",price:"₹300",photo:"https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=180&q=85"},
  {name:"Sharma Electrician",rating:"4.6",reviews:"98",price:"₹250",photo:"https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=180&q=85"},
  {name:"Mohan Tech Services",rating:"4.7",reviews:"75",price:"₹300",photo:"https://images.unsplash.com/photo-1590479773265-7464e5d48118?auto=format&fit=crop&w=180&q=85"},
];

export default function HomePage() {
  const { language } = useLanguage();
  return <main className="ak-mobile-shell pb-24">
    <header className="px-4 pb-3 pt-4">
      <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <ApnaKaamLogo compact />
          <div><p className="text-base font-black text-[#10243E]">Apna Kaam</p><p className="text-[10px] text-slate-500">आपका काम, हमारे साथ</p></div>
        </Link>
        <div className="flex items-center gap-2"><LanguageToggle/><Link href="/notifications" className="rounded-full border bg-white p-2.5 shadow-sm"><Bell size={19}/></Link></div>
      </div>
      <Link href="/locations" className="mt-3 flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm">
        <span className="flex items-center gap-2 text-sm font-extrabold text-[#10243E]"><MapPin size={18} className="text-[#ff6500]"/>Ganj Basoda, Vidisha</span>
        <ChevronDown size={15}/>
      </Link>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 shadow-sm"><Search size={19} className="text-slate-500"/><span className="flex-1 text-sm text-slate-400">{language === "hi" ? "आपको कौन सी सेवा चाहिए?" : "What service do you need?"}</span></div>
    </header>

    <section className="px-4"><div className="ak-banner p-5 text-white"><div className="max-w-[68%]"><p className="text-[11px] font-semibold text-white/75">Apna Kaam · Trusted Local Experts</p><h1 className="mt-2 text-2xl font-black leading-tight">{language === "hi" ? "घर के हर काम के लिए विश्वसनीय सेवा प्रदाता" : "Trusted service providers for every home job"}</h1><p className="mt-2 text-xs text-white/85">Safe · Verified · On Time Service</p></div></div></section>
    <section className="px-4 pt-5"><div className="grid grid-cols-4 gap-2">{services.map(([id,icon,en,hi])=><Link key={id} href={id === "more" ? "/services" : "/providers?service=" + id} className="flex min-h-[96px] flex-col items-center justify-center rounded-2xl border bg-white p-2 text-center shadow-sm"><span className="text-2xl">{icon}</span><b className="mt-1 text-[11px] text-[#10243E]">{language === "hi" ? hi : en}</b></Link>)}</div></section>
    <section className="px-4 pt-6"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-black">Top Rated Providers</h2><p className="text-xs text-slate-500">{language === "hi" ? "सर्वश्रेष्ठ सेवा प्रदाता" : "Best service providers near you"}</p></div><Link href="/providers" className="text-sm font-bold text-[#ff6500]">See All</Link></div><div className="space-y-3">{providers.map(p=><Link key={p.name} href="/providers" className="ak-card flex items-center gap-3 p-3"><img className="ak-worker-photo" src={p.photo} alt="" /><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-extrabold">{p.name}</h3><div className="mt-1 flex items-center gap-2 text-xs"><span className="font-bold text-[#ff6500]"><Star size={13} className="mr-0.5 inline fill-current"/>{p.rating}</span><span className="text-slate-500">({p.reviews} reviews)</span></div><div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><MapPin size={12}/>Ganj Basoda · 2 km <ShieldCheck size={13} className="ml-1 text-green-600"/><span className="font-bold text-green-600">Verified</span></div></div><div className="text-right"><b className="text-sm">{p.price}</b><p className="text-[10px] text-slate-400">Onwards</p></div></Link>)}</div></section>
    <div className="px-4 pt-6"><div className="rounded-2xl bg-[#10243E] p-4 text-white"><div className="flex items-center gap-3"><ApnaKaamLogo compact/><div><b className="text-sm">Apna Kaam</b><p className="text-[11px] text-white/70">आपका काम, हमारे साथ</p></div></div></div></div>
  </main>;
}