"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Apna Kaam application error:", error);
  }, [error]);

  return (
    <main className="ak-mobile-shell flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="rounded-3xl border bg-white p-7 shadow-sm">
        <div className="text-4xl">⚠️</div>
        <h1 className="mt-4 text-2xl font-black text-[#10243E]">कुछ गलत हो गया</h1>
        <p className="mt-2 text-sm text-slate-500">Page load करते समय समस्या आई। दोबारा कोशिश करें।</p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => reset()} className="ak-orange flex-1 rounded-2xl px-5 py-3 font-black text-white">
            Retry
          </button>
          <Link href="/" className="flex-1 rounded-2xl border px-5 py-3 font-black text-[#10243E]">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
