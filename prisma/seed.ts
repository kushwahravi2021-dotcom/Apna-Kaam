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

  const adminPhone = process.env.ADMIN_PHONE?.replace(/\D/g, "");
  if (adminPhone) {
    if (adminPhone.length !== 10) throw new Error("ADMIN_PHONE must contain exactly 10 digits.");
    await prisma.user.upsert({
      where: { phone: `+91${adminPhone}` },
      update: { role: "ADMIN" },
      create: { phone: `+91${adminPhone}`, role: "ADMIN" },
    });
    console.log("Configured ADMIN_PHONE as an admin account.");
  } else {
    console.log("ADMIN_PHONE not set; no admin account was changed.");
  }
  console.log("Apna Kaam seed data ready.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
