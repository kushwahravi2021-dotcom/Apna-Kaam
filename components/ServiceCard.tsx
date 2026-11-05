import Link from "next/link";
import {
  AirVent, Bike, Brush, Car, Droplets, Hammer, HardHat, Laptop, Milk,
  Paintbrush, Refrigerator, Scissors, Sparkles, Tv, Truck, UserRound,
  WashingMachine, Wrench, Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Service } from "@/lib/services";

const iconMap: Record<string, LucideIcon> = {
  plumber: Wrench,
  electrician: Zap,
  mistri: Hammer,
  labour: HardHat,
  carpenter: Scissors,
  painter: Paintbrush,
  cleaning: Brush,
  "tank-cleaning": Droplets,
  "ac-repair": AirVent,
  "cooler-repair": AirVent,
  "fridge-repair": Refrigerator,
  "washing-machine": WashingMachine,
  "tv-repair": Tv,
  "ro-repair": Droplets,
  vegetable: Sparkles,
  milk: Milk,
  water: Droplets,
  cab: Car,
  auto: Bike,
  driver: UserRound,
  travel: Truck,
  transport: Truck,
};

const iconTone: Record<string, string> = {
  "Home Services": "bg-teal-50 text-teal-700",
  Repair: "bg-sky-50 text-sky-700",
  "Daily Needs": "bg-amber-50 text-amber-700",
  "Travel & Transport": "bg-violet-50 text-violet-700",
};

export default function ServiceCard({ service }: { service: Service }) {
  const Icon = iconMap[service.id] ?? Laptop;
  return (
    <Link
      href={`/providers?service=${service.id}`}
      className="group flex min-h-32 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconTone[service.group] ?? "bg-slate-50 text-slate-700"}`}>
        <Icon size={25} strokeWidth={2.2} />
      </span>
      <span className="mt-2 text-xs font-bold leading-tight text-slate-800">{service.name}</span>
      <span className="mt-1 text-[10px] text-slate-400">पास में</span>
    </Link>
  );
}