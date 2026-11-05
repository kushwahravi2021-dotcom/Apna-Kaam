"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "hi" | "en";

const dictionary = {
  hi: { location:"आपका स्थान", tagline:"Local & trusted", homeTitle:"Ghar ki har zarurat,", homeTitle2:"ek hi app par.", search:"आपको क्या सेवा चाहिए?", seeAll:"सभी देखें", language:"भाषा", hindi:"हिंदी", english:"English", homeServices:"Home Services", repair:"Repair", dailyNeeds:"Daily Needs", travel:"Travel & Transport" },
  en: { location:"Your location", tagline:"Local & trusted", homeTitle:"Every household need,", homeTitle2:"in one app.", search:"What service do you need?", seeAll:"View all", language:"Language", hindi:"Hindi", english:"English", homeServices:"Home Services", repair:"Repair", dailyNeeds:"Daily Needs", travel:"Travel & Transport" },
} as const;

type Dictionary = typeof dictionary.en;
const LanguageContext = createContext<{language:Language;setLanguage:(language:Language)=>void;t:Dictionary}>({language:"hi",setLanguage:()=>{},t:dictionary.hi});

export function LanguageProvider({children}:{children:React.ReactNode}) {
  const [language,setLanguageState]=useState<Language>("hi");
  useEffect(()=>{const saved=window.localStorage.getItem("apna-kaam-language"); if(saved==="hi"||saved==="en") setLanguageState(saved);},[]);
  const setLanguage=(next:Language)=>{setLanguageState(next);window.localStorage.setItem("apna-kaam-language",next);document.documentElement.lang=next;};
  const value=useMemo(()=>({language,setLanguage,t:dictionary[language] as Dictionary}),[language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){return useContext(LanguageContext);}
