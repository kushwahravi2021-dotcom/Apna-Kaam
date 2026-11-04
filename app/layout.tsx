import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Apna Kaam",
  description: "Ghar ki har zarurat, ek hi app par.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <body>
        <main className="mx-auto min-h-screen w-full max-w-md bg-white shadow-sm">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}