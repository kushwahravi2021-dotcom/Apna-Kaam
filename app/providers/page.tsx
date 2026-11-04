import { Suspense } from "react";
import ProvidersClient from "./ProvidersClient";
export default function Page() {
  return <Suspense fallback={<main className="min-h-screen bg-gray-50 p-5 text-sm text-gray-500">लोड हो रहा है...</main>}><ProvidersClient /></Suspense>;
}
