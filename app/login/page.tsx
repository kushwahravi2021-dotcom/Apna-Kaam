import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white px-5 py-10">
      <div className="mx-auto max-w-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">🏠</div>
          <h1 className="mt-4 text-2xl font-bold">Apna Kaam</h1>
          <p className="mt-1 text-sm text-gray-500">Ghar ki har zarurat, ek hi app par.</p>
        </div>
        <div className="mt-10">
          <label className="text-sm font-semibold">Mobile Number</label>
          <div className="mt-2 flex rounded-xl border px-3">
            <span className="flex items-center border-r pr-3 text-sm">+91</span>
            <input className="w-full px-3 py-3 outline-none" placeholder="10 digit mobile number" inputMode="numeric" maxLength={10} />
          </div>
          <button className="mt-4 w-full rounded-xl bg-green-600 py-3.5 font-semibold text-white">Send OTP</button>
          <p className="mt-4 text-center text-xs text-gray-500">OTP authentication production setup ke baad connect ki jayegi.</p>
          <Link href="/" className="mt-6 block text-center text-sm font-semibold text-green-700">← Home पर जाएं</Link>
        </div>
      </div>
    </div>
  );
}