"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Search } from "lucide-react";

type District = { code: string; name: string };
type Tehsil = { code: string; name: string };
type Place = { display_name: string; lat: string; lon: string; type?: string; name?: string };

export default function LocationsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [districtCode, setDistrictCode] = useState("");
  const [tehsilCode, setTehsilCode] = useState("");
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Place | null>(null);

  const district = useMemo(() => districts.find((d) => d.code === districtCode), [districts, districtCode]);
  const tehsil = useMemo(() => tehsils.find((t) => t.code === tehsilCode), [tehsils, tehsilCode]);

  useEffect(() => {
    fetch("https://india-lgd-index-api.vercel.app/v1/districts?state=23")
      .then((r) => r.json())
      .then((d) => setDistricts(d.data || []))
      .catch(() => setDistricts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!districtCode) {
      setTehsils([]);
      setTehsilCode("");
      return;
    }
    fetch(`https://india-lgd-index-api.vercel.app/v1/subdistricts?district=${districtCode}`)
      .then((r) => r.json())
      .then((d) => setTehsils(d.data || []))
      .catch(() => setTehsils([]));
  }, [districtCode]);

  async function searchPlaces() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const parts = [q, tehsil?.name, district?.name, "Madhya Pradesh", "India"].filter(Boolean);
      const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=20&countrycodes=in&addressdetails=1&q=" + encodeURIComponent(parts.join(", "));
      const r = await fetch(url);
      const d = await r.json();
      setPlaces(Array.isArray(d) ? d : []);
      if (Array.isArray(d) && d[0]) setSelected(d[0]);
    } catch {
      setPlaces([]);
    } finally {
      setSearching(false);
    }
  }

  const mapSrc = selected
    ? `https://www.google.com/maps?q=${selected.lat},${selected.lon}&output=embed`
    : "https://www.google.com/maps?q=Madhya%20Pradesh%2C%20India&output=embed";

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-20 border-b bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-full p-2 hover:bg-slate-100"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-xl font-extrabold">मध्य प्रदेश Locations</h1>
            <p className="text-xs text-slate-500">District → Tehsil → Village / City → Map</p>
          </div>
        </div>
      </header>

      <section className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-2">
          {[["Districts", 55], ["Tehsils", "445+"], ["Villages", "57,497"]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border bg-white p-3 shadow-sm">
              <p className="text-xl font-extrabold text-teal-700">{value}</p>
              <p className="text-[11px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-bold">जिला</label>
          <select value={districtCode} onChange={(e) => { setDistrictCode(e.target.value); setTehsilCode(""); }} className="w-full rounded-xl border bg-white px-3 py-3 text-sm">
            <option value="">सभी 55 जिले</option>
            {districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
          </select>

          <label className="mb-2 mt-4 block text-sm font-bold">तहसील</label>
          <select value={tehsilCode} onChange={(e) => setTehsilCode(e.target.value)} disabled={!districtCode} className="w-full rounded-xl border bg-white px-3 py-3 text-sm disabled:bg-slate-100">
            <option value="">सभी तहसील</option>
            {tehsils.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>

          <div className="mt-4 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border bg-slate-50 px-3 py-3">
              <Search size={18} className="text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchPlaces()} className="w-full bg-transparent text-sm outline-none" placeholder="गांव / शहर खोजें..." />
            </div>
            <button onClick={searchPlaces} disabled={searching || !query.trim()} className="rounded-xl bg-teal-700 px-4 text-sm font-bold text-white disabled:opacity-50">
              {searching ? "..." : "Search"}
            </button>
          </div>
        </div>

        {loading && <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">जिले लोड हो रहे हैं...</p>}

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-extrabold">Search Results</h2>
          <div className="space-y-2">
            {places.map((p, i) => (
              <button key={`${p.lat}-${p.lon}-${i}`} onClick={() => setSelected(p)} className="w-full rounded-xl border p-3 text-left hover:border-teal-300 hover:bg-teal-50">
                <p className="font-semibold">{p.name || p.display_name.split(",")[0]}</p>
                <p className="mt-1 text-xs text-slate-500">{p.display_name}</p>
              </button>
            ))}
            {!searching && query && places.length === 0 && <p className="text-sm text-slate-500">कोई map result नहीं मिला। गांव का नाम + तहसील चुनकर फिर Search करें।</p>}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <MapPin size={18} className="text-teal-700" />
            <div>
              <p className="font-bold">Map</p>
              <p className="text-xs text-slate-500">{selected?.display_name || "Madhya Pradesh"}</p>
            </div>
          </div>
          <iframe title="Madhya Pradesh map" src={mapSrc} className="h-[380px] w-full border-0" loading="lazy" />
        </div>

        <div className="rounded-2xl bg-teal-50 p-4 text-xs leading-5 text-teal-900">
          <p className="font-bold">Location data</p>
          <p className="mt-1">District/tehsil hierarchy uses LGD codes. Village/city map search uses OpenStreetMap geocoding, so the selected place can be opened on the map without putting a map API key in the app.</p>
        </div>
      </section>
    </main>
  );
}
