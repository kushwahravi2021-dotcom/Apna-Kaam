"use client";

import Link from "next/link";
import { Bell, ChevronRight, MapPin, Search, Sparkles } from "lucide-react";
import { services } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomePage() {
  const { t } = useLanguage();
  const groups = [
    { key: "Home Services", label: t.homeServices },
    { key: "Repair", label: t.repair },
    { key: "Daily Needs", label: t.dailyNeeds },
    { key: "Travel & Transport", label: t.travel },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <section className="home-hero px-5 pb-8 pt-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/75">{t.location}</p>
            <Link href="/locations" className="mt-1 flex items-center gap-1 text-sm font-bold">
              <MapPin size={16} /> Ganj Basoda, Vidisha <ChevronRight size={15} />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/notifications" className="rounded-full bg-white/15 p-3 backdrop-blur-sm transition hover:bg-white/25" aria-label="Notifications">
              <Bell size={20} />
            </Link>
          </div>
        </div>
        <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-white/80">
          <span className="rounded-full bg-white/15 px-3 py-1">Apna Kaam</span>
          <span className="flex items-center gap-1"><Sparkles size={13} /> {t.tagline}</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{t.homeTitle}<br />{t.homeTitle2}</h1>
        <Link href="/services" className="mt-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm text-slate-500 shadow-lg shadow-slate-900/10">
          <Search size={20} />
          <span>{t.search}</span>
        </Link>
      </section>
      <section className="px-4 py-6">
        {groups.map((group) => (
          <div key={group.key} className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">{group.label}</h2>
              <Link href="/services" className="text-sm font-bold text-teal-700">{t.seeAll}</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {services.filter((s) => s.group === group.key).slice(0, 6).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}