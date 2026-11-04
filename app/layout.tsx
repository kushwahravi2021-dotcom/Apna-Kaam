import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

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
        <ServiceWorkerRegister />
        <main className="mx-auto min-h-screen w-full max-w-md bg-white shadow-sm">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}