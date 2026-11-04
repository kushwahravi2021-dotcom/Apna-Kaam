import Link from "next/link";
import { Search } from "lucide-react";
import { services } from "@/lib/services";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-4">
        <h1 className="text-xl font-bold">Services</h1>
        <div className="mt-3 flex items-center gap-2 rounded-xl border bg-gray-50 px-3 py-3">
          <Search size={18} className="text-gray-400" />
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Service खोजें..." />
        </div>
      </header>
      <section className="space-y-5 p-4">
        {["Home Services", "Repair", "Daily Needs", "Travel & Transport"].map((group) => (
          <div key={group}>
            <h2 className="mb-3 font-bold">{group}</h2>
            <div className="space-y-2">
              {services.filter((s) => s.group === group).map((service) => (
                <Link key={service.id} href={`/providers?service=${service.id}`} className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{service.icon}</span>
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}