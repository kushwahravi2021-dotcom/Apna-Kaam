"use client";
import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string; amount: number; currency: string; name: string; description: string; order_id: string;
      handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
      modal?: { ondismiss?: () => void };
      theme?: { color: string };
    }) => { open: () => void };
  }
}
export default function PayButton({ bookingId, onPaid }: { bookingId: string; onPaid: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function pay() {
    if (!window.Razorpay) { setMessage("Payment window अभी load हो रही है।"); return; }
    setBusy(true); setMessage("");
    try {
      const orderResponse = await fetch("/api/payments/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId }) });
      const order = await orderResponse.json();
      if (!orderResponse.ok || !order.ok) throw new Error(order.message || "Payment order नहीं बना");
      const checkout = new window.Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency, name: "Apna Kaam",
        description: "Service booking payment", order_id: order.orderId, theme: { color: "#15803d" },
        handler: async (response) => {
          const verifyResponse = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, ...response }) });
          const verified = await verifyResponse.json();
          if (!verifyResponse.ok || !verified.ok) { setMessage(verified.message || "Payment verify नहीं हुआ।"); return; }
          setMessage("Payment सफल रहा।"); onPaid();
        },
        modal: { ondismiss: () => setMessage("Payment window बंद की गई।") }
      });
      checkout.open();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Payment शुरू नहीं हुआ"); }
    finally { setBusy(false); }
  }
  return <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3">
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onLoad={() => setLoaded(true)} onError={() => setMessage("Payment checkout load नहीं हो सका।")} />
    <button disabled={!loaded || busy} onClick={pay} className="w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Payment शुरू हो रहा है..." : loaded ? "Pay Online" : "Payment लोड हो रहा है..."}</button>
    {message && <p role="status" className="mt-2 text-xs text-green-900">{message}</p>}
  </div>;
}
