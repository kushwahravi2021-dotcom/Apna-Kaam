import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "Apna Kaam",
  description: "Ghar ki har zarurat, ek hi app par.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Apna Kaam" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <body>
        {process.env.DEMO_MODE === "true" && <div className="bg-amber-300 px-3 py-2 text-center text-xs font-bold text-amber-950">DEMO TESTING MODE · असली payment/SMS बंद हैं · कृपया वास्तविक निजी जानकारी न डालें</div>}
        <ServiceWorkerRegister />
        <LanguageProvider>
          <main className="mx-auto min-h-screen w-full max-w-md bg-white shadow-sm">{children}</main>
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}