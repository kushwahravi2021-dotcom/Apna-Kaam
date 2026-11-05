import Link from "next/link";

export default function NotFound() {
  return (
    <main className="ak-mobile-shell flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="rounded-3xl border bg-white p-7 shadow-sm">
        <div className="text-5xl font-black text-[#ff6500]">404</div>
        <h1 className="mt-3 text-2xl font-black text-[#10243E]">Page नहीं मिली</h1>
        <p className="mt-2 text-sm text-slate-500">जिस page की तलाश है वह उपलब्ध नहीं है या हट गया है।</p>
        <Link href="/" className="ak-orange mt-6 block rounded-2xl px-5 py-3 font-black text-white">
          वापस Home पर जाएं
        </Link>
      </div>
    </main>
  );
}
