import Link from "next/link";
import { Phone, MessageCircle, Star, MapPin } from "lucide-react";

const providers = [
  { id: "demo-1", name: "Ramesh Plumbing", service: "Plumber", rating: 4.8, reviews: 124, distance: "2.1 km", price: "₹100 से", verified: true },
  { id: "demo-2", name: "Amit Home Services", service: "Plumber & Electrician", rating: 4.6, reviews: 89, distance: "3.4 km", price: "₹150 से", verified: true },
  { id: "demo-3", name: "Suresh Repair", service: "Home Repair", rating: 4.5, reviews: 57, distance: "4.2 km", price: "₹120 से", verified: false }
];

export default function ProvidersPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="border-b bg-white px-4 py-4">
        <h1 className="text-xl font-bold">Nearby Providers</h1>
        <p className="mt-1 text-sm text-gray-500">आपके आसपास उपलब्ध service providers</p>
      </header>
      <section className="space-y-3 p-4">
        {providers.map((p) => (
          <article key={p.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">👨‍🔧</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold">{p.name}</h2>
                  {p.verified && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">VERIFIED</span>}
                </div>
                <p className="text-sm text-gray-500">{p.service}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Star size={13} className="fill-yellow-400 text-yellow-400" /> {p.rating} ({p.reviews})</span>
                  <span className="flex items-center gap-1"><MapPin size={13} /> {p.distance}</span>
                  <span>{p.price}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button className="rounded-xl border py-2 text-xs font-semibold"><Phone size={15} className="mx-auto mb-1" />Call</button>
              <button className="rounded-xl border py-2 text-xs font-semibold"><MessageCircle size={15} className="mx-auto mb-1" />WhatsApp</button>
              <Link href={`/bookings?provider=${p.id}`} className="rounded-xl bg-green-600 py-2 text-center text-xs font-semibold text-white">Book Now</Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}