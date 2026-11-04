import Link from "next/link";
import type { Service } from "@/lib/services";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/providers?service=${service.id}`} className="flex min-h-28 flex-col items-center justify-center rounded-2xl border bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow">
      <span className="text-3xl">{service.icon}</span>
      <span className="mt-2 text-sm font-semibold text-gray-800">{service.name}</span>
    </Link>
  );
}