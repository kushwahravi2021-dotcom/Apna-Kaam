import Link from "next/link";
import { MapPin, Bell, Search, ChevronRight } from "lucide-react";
import { services } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";

export default function HomePage() {
  const groups = ["Home Services", "Repair", "Daily Needs", "Travel & Transport"];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <section className="bg-green-600 px-5 pb-7 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-green-100">आपका स्थान</p>
            <button className="mt-1 flex items-center gap-1 text-sm font-semibold">
              <MapPin size={16} /> Chhindwara <ChevronRight size={15} />
            </button>
          </div>
          <button className="rounded-full bg-white/15 p-2"><Bell size={20} /></button>
        </div>
        <h1 className="mt-7 text-2xl font-bold">Apna Kaam</h1>
        <p className="mt-1 text-sm text-green-50">Ghar ki har zarurat, ek hi app par.</p>
        <Link href="/services" className="mt-5 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow">
          <Search size={19} /> आपको क्या सेवा चाहिए?
        </Link>
      </section>

      <section className="px-4 py-5">
        {groups.map((group) => (
          <div key={group} className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">{group}</h2>
              <Link href="/services" className="text-sm font-semibold text-green-700">सभी देखें</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {services.filter((s) => s.group === group).slice(0, 6).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}