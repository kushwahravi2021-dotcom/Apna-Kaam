import Link from "next/link";

export default function ApnaKaamLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={compact ? "flex items-center gap-2" : "flex flex-col items-center"}>
      <span className={compact ? "flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm" : "flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-xl"}>
        <svg viewBox="0 0 100 100" className={compact ? "h-8 w-8" : "h-20 w-20"} aria-hidden="true">
          <path d="M12 47 50 16l38 31v38H12Z" fill="none" stroke="#10243E" strokeWidth="7" strokeLinejoin="round"/>
          <path d="M39 91V58" stroke="#10243E" strokeWidth="6" strokeLinecap="round"/>
          <path d="M28 58c-7 8-7 18 0 24 7-6 7-16 0-24Z" fill="#39A852"/>
          <path d="M71 57c-7 6-7 17 0 24 7-7 7-18 0-24Z" fill="#F56A00"/>
          <circle cx="50" cy="47" r="10" fill="#F56A00"/>
          <path d="M50 57V78M42 66h16" stroke="#1677C8" strokeWidth="6" strokeLinecap="round"/>
          <path d="M63 38v17M58 43h10" stroke="#1677C8" strokeWidth="5" strokeLinecap="round"/>
        </svg>
      </span>
      {!compact && <span className="mt-3 text-center"><strong className="block text-2xl font-black tracking-tight text-[#10243E]">Apna Kaam</strong><span className="text-sm font-bold text-[#10243E]">आपका काम, हमारे साथ</span></span>}
    </Link>
  );
}