"use client";
import { Languages } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
export default function LanguageToggle(){
 const {language,setLanguage,t}=useLanguage();
 return <div className="flex items-center gap-1 rounded-full bg-white/15 p-1 backdrop-blur-sm" aria-label={t.language}>
  <Languages size={16} className="ml-2 text-white/80"/>
  <button type="button" onClick={()=>setLanguage("hi")} className={`rounded-full px-2.5 py-1 text-xs font-bold ${language==="hi"?"bg-white text-slate-900":"text-white/85"}`} aria-pressed={language==="hi"}>{t.hindi}</button>
  <button type="button" onClick={()=>setLanguage("en")} className={`rounded-full px-2.5 py-1 text-xs font-bold ${language==="en"?"bg-white text-slate-900":"text-white/85"}`} aria-pressed={language==="en"}>{t.english}</button>
 </div>;
}
