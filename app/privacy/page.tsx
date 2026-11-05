import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="ak-mobile-shell min-h-screen bg-slate-50 px-4 py-5">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-bold text-[#ff6500]">← Home</Link>
        <h1 className="mt-5 text-2xl font-black text-[#10243E]">Privacy Policy</h1>
        <p className="mt-2 text-xs text-slate-500">Last updated: 5 November 2026</p>
        <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
          <section><h2 className="font-black text-[#10243E]">1. Information we collect</h2><p className="mt-1">We may collect your mobile number, name, service address, booking details, provider profile information, reviews and support/complaint details needed to operate Apna Kaam.</p></section>
          <section><h2 className="font-black text-[#10243E]">2. How we use information</h2><p className="mt-1">We use this information to authenticate accounts, match customers with providers, process bookings, send service notifications, prevent abuse and provide customer support.</p></section>
          <section><h2 className="font-black text-[#10243E]">3. Payments and OTP</h2><p className="mt-1">When enabled, OTP delivery is handled by Twilio and online payments are processed by Razorpay. Apna Kaam does not store your payment card credentials.</p></section>
          <section><h2 className="font-black text-[#10243E]">4. Location</h2><p className="mt-1">Service addresses and optional coordinates are used to help arrange local services. Only provide an address you are comfortable sharing for the requested service.</p></section>
          <section><h2 className="font-black text-[#10243E]">5. Data retention and deletion</h2><p className="mt-1">Account and booking records may be retained as needed for service history, safety, fraud prevention and legal obligations. You can contact support to request account assistance or deletion where applicable.</p></section>
          <section><h2 className="font-black text-[#10243E]">6. Contact</h2><p className="mt-1">For privacy questions or data requests, use the in-app Support page.</p></section>
        </div>
      </div>
    </main>
  );
}
