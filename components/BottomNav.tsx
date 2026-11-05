"use client";
import Link from "next/link";
import { Home, CalendarCheck, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
const items=[{href:"/",label:"Home",icon:Home},{href:"/bookings",label:"Bookings",icon:CalendarCheck},{href:"/support",label:"Chat",icon:MessageCircle},{href:"/profile",label:"Profile",icon:User}];
export default function BottomNav(){const pathname=usePathname();return <nav className="ak-bottom-nav safe-bottom px-4 py-2"><div className="grid grid-cols-4 gap-1">{items.map(({href,label,icon:Icon})=>{const active=pathname===href;return <Link key={href} href={href} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold ${active?"text-[#ff6500]":"text-slate-500"}`}><Icon size={20} strokeWidth={active?2.6:2}/><span>{label}</span></Link>})}</div></nav>}