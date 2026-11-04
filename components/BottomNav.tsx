"use client";

import Link from "next/link";
import { Home, Search, CalendarCheck, User } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Search", icon: Search },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t bg-white/95 px-3 py-2 backdrop-blur safe-bottom">
      <div className="grid grid-cols-4 gap-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs text-gray-600 hover:bg-gray-50">
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}