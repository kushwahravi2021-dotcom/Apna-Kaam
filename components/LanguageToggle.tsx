"use client";
import { useLanguage } from "@/components/LanguageProvider";
export default function LanguageToggle() {
 const {language,setLanguage}=useLanguage();
 return <div className="ak-lang" aria-label="Language"><button type="button" className={language==="hi"?"active":""} onClick={()=>setLanguage("hi")} aria-pressed={language==="hi"}>हिंदी</button><button type="button" className={language==="en"?"active":""} onClick={()=>setLanguage("en")} aria-pressed={language==="en"}>English</button></div>;
}