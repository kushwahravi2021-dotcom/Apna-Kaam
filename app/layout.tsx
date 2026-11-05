import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { LanguageProvider } from "@/components/LanguageProvider";
export const metadata: Metadata={title:"Apna Kaam",description:"आपका काम, हमारे साथ",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,statusBarStyle:"default",title:"Apna Kaam"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="hi"><body>{process.env.DEMO_MODE==="true"&&<div className="bg-amber-300 px-3 py-2 text-center text-[11px] font-bold text-amber-950">DEMO TESTING MODE · असली payment/SMS बंद हैं</div>}<ServiceWorkerRegister/><LanguageProvider><main className="ak-shell">{children}</main><BottomNav/></LanguageProvider></body></html>}