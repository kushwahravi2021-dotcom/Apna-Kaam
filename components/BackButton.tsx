"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Admin panel has its own navigation; don't show the floating back button there.
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/admin")) return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="वापस जाएँ"
      className="fixed left-3 top-3 z-50 flex h-10 items-center gap-1 rounded-full bg-white px-3 text-sm font-bold text-gray-800 shadow-lg ring-1 ring-black/5"
    >
      <span className="text-lg leading-none">←</span>
      <span>Back</span>
    </button>
  );
}
