"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BarChart3, BriefcaseBusiness, CalendarDays, CreditCard, LayoutDashboard, Settings, UserCheck, Users } from "lucide-react";

type Provider = {
  id: string;
  bio: string | null;
  experienceYears: number | null;
  startingPrice: string | number | null;
  serviceArea: string | null;
  verification: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  availability: "AVAILABLE" | "BUSY" | "OFFLINE";
  deletedAt: string | null;
  createdAt: string;
  user: { id: string; name: string | null; phone: string; city: string | null; area: string | null };
  services: { category: { id: string; name: string; icon: string | null } }[];
};

type Result = { ok?: boolean; message?: string; providers?: Provider[] };
type Section = "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED" | "ACTIVE" | "INACTIVE" | "DELETED";

const sectionLabels: Record<Section, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  BLOCKED: "Blocked",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
};

function inSection(provider: Provider, section: Section) {
  if (section === "DELETED") return Boolean(provider.deletedAt);
  if (provider.deletedAt) return false;
  if (section === "BLOCKED") return provider.verification === "SUSPENDED";
  if (section === "ACTIVE") return provider.verification === "APPROVED" && provider.availability === "AVAILABLE";
  if (section === "INACTIVE") return provider.verification === "APPROVED" && provider.availability !== "AVAILABLE";
  return provider.verification === section;
}

export default function AdminPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [section, setSection] = useState<Section>("PENDING");

  const load = useCallback(async () => {
    try {
      setError("");
      const response = await fetch("/api/admin/providers");
      const data = (await response.json()) as Result;
      if (!response.ok || !data.ok) throw new Error(data.message || "Admin access नहीं मिला");
      setProviders(data.providers || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();
        if (!response.ok || !data.ok || data.user?.role !== "ADMIN") {
          window.location.replace("/");
          return;
        }
        await load();
      } catch {
        window.location.replace("/");
      }
    })();
  }, [load]);

  const act = async (providerId: string, action: string) => {
    if (action === "DELETE" && !window.confirm("क्या आप इस provider को Deleted section में भेजना चाहते हैं?")) return;
    setBusy(providerId + action);
    setError("");
    try {
      const response = await fetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, action }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Action failed");
      await load();
      if (action === "APPROVE" || action === "UNBLOCK" || action === "RESTORE") setSection("APPROVED");
      if (action === "REJECT") setSection("REJECTED");
      if (action === "BLOCK") setSection("BLOCKED");
      if (action === "ACTIVATE") setSection("ACTIVE");
      if (action === "DEACTIVATE") setSection("INACTIVE");
      if (action === "DELETE") setSection("DELETED");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy("");
    }
  };

  const visibleProviders = providers.filter((provider) => inSection(provider, section));

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 bg-[#10243E] p-5 text-white md:block">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">🏠</span>
            <div><b>Apna Kaam</b><p className="text-[10px] text-white/60">आपका काम, हमारे साथ</p></div>
          </div>
          <nav className="mt-6 space-y-2">
            {[
              { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
              { icon: Users, label: "Users", href: "/admin" },
              { icon: UserCheck, label: "Providers", href: "/admin" },
              { icon: CalendarDays, label: "Bookings", href: "/admin/bookings" },
              { icon: BriefcaseBusiness, label: "Services", href: "/admin" },
              { icon: CreditCard, label: "Payments", href: "/admin" },
              { icon: BarChart3, label: "Reports", href: "/admin" },
              { icon: Settings, label: "Settings", href: "/admin/settings" },
            ].map(({ icon: Icon, label, href }) => (
              <Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${label === "Dashboard" ? "bg-[#ff6500]" : "text-white/75 hover:bg-white/10"}`}>
                <Icon size={17} />{label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 p-4 md:p-7">
          <header className="flex items-center justify-between">
            <div><h1 className="text-2xl font-black">Dashboard</h1><p className="text-sm text-slate-500">Apna Kaam Admin Panel</p></div>
            <div className="rounded-xl border bg-white px-3 py-2 text-xs font-bold">Admin</div>
          </header>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["Total Users", "1,248", "↑12%"], ["Active Providers", String(providers.filter((p) => inSection(p, "ACTIVE")).length), "Live"], ["Total Bookings", "2,430", "↑15%"], ["Total Revenue", "₹2,84,500", "↑16%"]].map(([title, value, change]) => (
              <div key={title} className="rounded-2xl border bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">{title}</p><b className="mt-2 block text-2xl">{value}</b><span className="text-xs font-bold text-green-600">{change}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 lg:col-span-2">
              <div className="flex items-center justify-between"><div><h2 className="font-black">Bookings Overview</h2><p className="text-xs text-slate-500">Last 30 days</p></div><BarChart3 className="text-[#ff6500]" /></div>
              <div className="mt-5 flex h-44 items-end gap-2">{[30,42,38,62,48,72,58,82,68,92,76,86,70,96,80,88].map((height, index) => <div key={index} className="flex-1 rounded-t bg-[#ff6500]/80" style={{ height: height + "%" }} />)}</div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <h2 className="font-black">Service Categories</h2>
              <div className="mt-5 flex items-center justify-center"><div className="flex h-36 w-36 items-center justify-center rounded-full border-[22px] border-[#ff6500]"><div className="text-center"><b className="block text-2xl">2,430</b><span className="text-[10px] text-slate-500">Bookings</span></div></div></div>
              <div className="mt-4 space-y-2 text-xs">{[["Electrician","28%"],["Plumber","22%"],["Carpenter","15%"],["Painter","12%"],["AC Service","10%"],["Others","13%"]].map(([name, percentage]) => <div key={name} className="flex justify-between"><span>{name}</span><b>{percentage}</b></div>)}</div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div><h2 className="font-black">Provider Management</h2><p className="text-xs text-slate-500">हर action के बाद provider अपनी सही section में चला जाएगा</p></div>
              <button onClick={() => void load()} className="text-sm font-bold text-[#ff6500]">Refresh</button>
            </div>

            {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {(Object.keys(sectionLabels) as Section[]).map((key) => {
                const count = providers.filter((provider) => inSection(provider, key)).length;
                return (
                  <button key={key} onClick={() => setSection(key)} className={`rounded-xl border px-2 py-3 text-left ${section === key ? "border-[#ff6500] bg-[#fff4ed]" : "bg-white"}`}>
                    <b className="block text-xs">{sectionLabels[key]}</b><span className="mt-1 block text-xl font-black">{count}</span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <p className="mt-5 text-sm text-slate-500">Loading...</p>
            ) : visibleProviders.length === 0 ? (
              <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">इस section में अभी कोई provider नहीं है।</p>
            ) : (
              <div className="mt-4 divide-y">
                {visibleProviders.map((provider) => (
                  <div key={provider.id} className="py-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <b className="text-sm">{provider.user.name || "Provider"}</b>
                        <p className="text-xs text-slate-500">{provider.user.phone} · {provider.user.city || "—"} · {provider.user.area || "—"}</p>
                        <p className="text-xs text-slate-500">{provider.services.map((service) => service.category.name).join(", ") || "No service"}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold">{provider.deletedAt ? "DELETED" : provider.verification}</span>
                        {!provider.deletedAt && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold">{provider.availability === "AVAILABLE" ? "ACTIVE" : "INACTIVE"}</span>}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {provider.deletedAt ? (
                        <button disabled={Boolean(busy)} onClick={() => void act(provider.id, "RESTORE")} className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-700">Restore</button>
                      ) : (
                        <>
                          {provider.verification === "PENDING" && <>
                            <button disabled={Boolean(busy)} onClick={() => void act(provider.id, "APPROVE")} className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-700">✓ Approve</button>
                            <button disabled={Boolean(busy)} onClick={() => void act(provider.id, "REJECT")} className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700">✕ Reject</button>
                          </>}
                          {provider.verification === "REJECTED" && <button disabled={Boolean(busy)} onClick={() => void act(provider.id, "APPROVE")} className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-700">Accept</button>}
                          {provider.verification === "SUSPENDED" ? <button disabled={Boolean(busy)} onClick={() => void act(provider.id, "UNBLOCK")} className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-700">Unblock</button> : <button disabled={Boolean(busy)} onClick={() => void act(provider.id, "BLOCK")} className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Block</button>}
                          {provider.verification === "APPROVED" && (provider.availability === "AVAILABLE" ? <button disabled={Boolean(busy)} onClick={() => void act(provider.id, "DEACTIVATE")} className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700">Inactive</button> : <button disabled={Boolean(busy)} onClick={() => void act(provider.id, "ACTIVATE")} className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-700">Active</button>)}
                          <button disabled={Boolean(busy)} onClick={() => void act(provider.id, "DELETE")} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
