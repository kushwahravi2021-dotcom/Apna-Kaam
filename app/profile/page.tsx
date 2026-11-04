import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-green-600 px-5 pb-8 pt-7 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl text-gray-700">👤</div>
          <div>
            <p className="text-xs text-green-100">Customer</p>
            <h1 className="text-xl font-bold">Guest User</h1>
            <p className="text-sm text-green-100">Login करके अपना profile बनाएं</p>
          </div>
        </div>
      </header>
      <section className="space-y-2 p-4">
        <Link href="/login" className="block rounded-2xl bg-green-600 p-4 text-center font-semibold text-white">Login / Register</Link>
        {["Saved Addresses", "Favorites", "Notifications", "Help & Support", "Privacy Policy", "Terms & Conditions"].map((item) => (
          <button key={item} className="flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left shadow-sm">
            <span>{item}</span><span className="text-gray-400">›</span>
          </button>
        ))}
      </section>
    </div>
  );
}