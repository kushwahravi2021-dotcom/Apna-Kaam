import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  ["Plumber","🔧","Home Services"],["Electrician","💡","Home Services"],["Mistri","🧱","Home Services"],
  ["Labour","👷","Home Services"],["Carpenter","🪚","Repair"],["AC Repair","❄️","Repair"],
  ["Appliance Repair","🛠️","Repair"],["Vegetable Seller","🥦","Daily Needs"],["Milk Seller","🥛","Daily Needs"],
  ["Water Tank Cleaning","🧼","Daily Needs"],["Cab","🚕","Travel & Transport"],["Travel Booking","🚌","Travel & Transport"],
];

async function main() {
  for (const [name, icon, groupName] of categories) {
    await prisma.category.upsert({
      where: { name },
      update: { icon, groupName, active: true },
      create: { name, icon, groupName },
    });
  }
  console.log("Apna Kaam seed data ready.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
