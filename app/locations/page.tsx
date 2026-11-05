"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, MapPin, Search } from "lucide-react";

type District = { code: string; name: string; tehsils: { code: string; name: string }[] };
type Village = { code: string; name: string; localName: string; districtCode: string; district: string; tehsilCode: string; tehsil: string; status: string };
type City = { code: string; name: string; localName: string; districtCode: string; district: string; type: string };
type LocationData = { counts: { districts: number; tehsils: number; villages: number; cities: number }; districts: District[]; villages: Village[]; cities: City[] };

export default function LocationsPage() {
  const [data, setData] = useState<LocationData | null>(null);
  const [districtCode, setDistrictCode] = useState("");
  const [tehsilCode, setTehsilCode] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ name: string; district: string; tehsil?: string } | null>(null);

  useEffect(() => {
    fetch("/data/mp-locations.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const district = data?.districts.find((d) => d.code === districtCode);
  const tehsils = district?.tehsils ?? [];

  const villages = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.villages
      .filter((v) => (!districtCode || v.districtCode === districtCode) && (!tehsilCode || v.tehsilCode === tehsilCode))
      .filter((v) => !q || v.name.toLowerCase().includes(q) || v.localName.toLowerCase().includes(q))
      .slice(0, 80);
  }, [data, districtCode, tehsilCode, query]);

  const cities = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.cities
      .filter((c) => !districtCode || c.districtCode === districtCode)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.localName.toLowerCase().includes(q))
      .slice(0, 50);
  }, [data, districtCode, query]);

  const mapQuery = selected ? [selected.name, selected.tehsil, selected.district, "Madhya Pradesh", "India"].filter(Boolean).join(", ") : "Madhya Pradesh, India";
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-20 border-b bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-full p-2 hover:bg-slate-100"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">मध्य प्रदेश Locations</h1>
            <p className="text-xs text-slate-500">District → Tehsil → Village / City</p>
          </div>
        </div>
      </header>

      <section className="space-y-4 p-4">
        {!data && <div className="rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">Location data तैयार हो रही है...</div>}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Districts", data.counts.districts],
                ["Tehsils", data.counts.tehsils],
                ["Villages", data.counts.villages],
                ["Cities / ULB", data.counts.cities],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border bg-white p-3 shadow-sm">
                  <p className="text-xl font-extrabold text-teal-700">{value.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <label className="mb-2 block text-sm font-bold">जिला</label>
              <select value={districtCode} onChange={(e) => { setDistrictCode(e.target.value); setTehsilCode(""); }} className="w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none">
                <option value="">सभी 55 जिले</option>
                {data.districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>

              <label className="mb-2 mt-4 block text-sm font-bold">तहसील</label>
              <select value={tehsilCode} onChange={(e) => setTehsilCode(e.target.value)} disabled={!district} className="w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none disabled:bg-slate-100">
                <option value="">सभी तहसील</option>
                {tehsils.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
              </select>

              <div className="mt-4 flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-3">
                <Search size={18} className="text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="गांव / शहर खोजें..." />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-extrabold">गांव</h2>
                  <span className="text-xs text-slate-400">पहले 80 परिणाम</span>
                </div>
                <div className="max-h-[520px] space-y-2 overflow-auto">
                  {villages.map((v) => (
                    <button key={v.code} onClick={() => setSelected({ name: v.name, district: v.district, tehsil: v.tehsil })} className="w-full rounded-xl border p-3 text-left transition hover:border-teal-300 hover:bg-teal-50">
                      <p className="font-semibold text-slate-900">{v.name}{v.localName ? ` • ${v.localName}` : ""}</p>
                      <p className="mt-1 text-xs text-slate-500">{v.tehsil} • {v.district} • LGD {v.code}</p>
                    </button>
                  ))}
                  {villages.length === 0 && <p className="p-4 text-sm text-slate-500">कोई गांव नहीं मिला।</p>}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-extrabold">शहर / नगर</h2>
                  <span className="text-xs text-slate-400">पहले 50 परिणाम</span>
                </div>
                <div className="max-h-[520px] space-y-2 overflow-auto">
                  {cities.map((c) => (
                    <button key={c.code} onClick={() => setSelected({ name: c.name, district: c.district })} className="w-full rounded-xl border p-3 text-left transition hover:border-teal-300 hover:bg-teal-50">
                      <p className="font-semibold text-slate-900">{c.name}{c.localName ? ` • ${c.localName}` : ""}</p>
                      <p className="mt-1 text-xs text-slate-500">{c.type} • {c.district} • LGD {c.code}</p>
                    </button>
                  ))}
                  {cities.length === 0 && <p className="p-4 text-sm text-slate-500">कोई शहर/नगर नहीं मिला।</p>}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <MapPin size={18} className="text-teal-700" />
                <div>
                  <p className="font-bold">Map</p>
                  <p className="text-xs text-slate-500">{selected ? `${selected.name}, ${selected.district}` : "Madhya Pradesh"}</p>
                </div>
              </div>
              <iframe title="Madhya Pradesh map" src={mapSrc} className="h-[360px] w-full border-0" loading="lazy" />
            </div>

            <div className="rounded-2xl bg-teal-50 p-4 text-xs leading-5 text-teal-900">
              <p className="font-bold">Data source</p>
              <p className="mt-1">Ministry of Panchayati Raj — Local Government Directory (LGD). LGD codes are used so duplicate village names can be distinguished correctly.</p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
