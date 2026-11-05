"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRouter() {
  const router = useRouter();
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/profile").then(async r => {
      const d = await r.json();
      if (!r.ok || !d.ok) { router.replace("/login"); return; }
      if (d.user?.role === "PROVIDER") router.replace("/provider/settings");
      else if (d.user?.role === "ADMIN") router.replace("/admin/settings");
      else router.replace("/profile");
    }).catch(() => setError("Settings load नहीं हुई।"));
  }, [router]);
  return <main className="min-h-screen bg-gray-50 p-5"><div className="mx-auto max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm">{error ? <p className="text-red-600">{error}</p> : <p>Settings खोल रही हैं...</p>}</div></main>;
}
