import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="ak-mobile-shell min-h-screen bg-slate-50 px-4 py-5">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-bold text-[#ff6500]">← Home</Link>
        <h1 className="mt-5 text-2xl font-black text-[#10243E]">Terms & Conditions</h1>
        <p className="mt-2 text-xs text-slate-500">Last updated: 5 November 2026</p>
        <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
          <section><h2 className="font-black text-[#10243E]">1. Using Apna Kaam</h2><p className="mt-1">Apna Kaam connects customers with local service providers. You must provide accurate account and service information and use the platform lawfully.</p></section>
          <section><h2 className="font-black text-[#10243E]">2. Bookings</h2><p className="mt-1">A booking request is subject to provider availability and acceptance. Customers should provide safe access and accurate service details. Providers must only accept work they are qualified and able to perform.</p></section>
          <section><h2 className="font-black text-[#10243E]">3. Payments</h2><p className="mt-1">Where online payment is enabled, the amount shown at checkout is processed through the configured payment gateway. Additional refunds, cancellations or disputes may depend on the applicable booking and payment policy.</p></section>
          <section><h2 className="font-black text-[#10243E]">4. Safety and conduct</h2><p className="mt-1">Do not misuse the platform, impersonate another person, upload unlawful content, attempt unauthorized access or submit fraudulent bookings or complaints.</p></section>
          <section><h2 className="font-black text-[#10243E]">5. Provider verification</h2><p className="mt-1">Verification status is intended to support trust but is not a guarantee of workmanship, availability or outcome. Customers should use appropriate caution when allowing any service provider into their premises.</p></section>
          <section><h2 className="font-black text-[#10243E]">6. Support</h2><p className="mt-1">If a booking or service issue occurs, use the in-app Support/Complaint flow so it can be reviewed by the Apna Kaam team.</p></section>
        </div>
      </div>
    </main>
  );
}
