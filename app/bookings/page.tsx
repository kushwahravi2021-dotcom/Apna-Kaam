import Link from "next/link";

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="border-b bg-white px-4 py-4">
        <h1 className="text-xl font-bold">My Bookings</h1>
      </header>
      <section className="p-4">
        <div className="rounded-2xl border bg-white p-8 text-center">
          <div className="text-4xl">📅</div>
          <h2 className="mt-3 font-bold">अभी कोई booking नहीं है</h2>
          <p className="mt-1 text-sm text-gray-500">अपनी जरूरत की service चुनकर booking करें।</p>
          <Link href="/services" className="mt-5 inline-block rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white">Service खोजें</Link>
        </div>
      </section>
    </div>
  );
}