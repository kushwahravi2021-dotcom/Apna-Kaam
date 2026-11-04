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


  if (process.env.DEMO_MODE === "true") {
    const demoProviders = [
      { phone: "+919999990001", name: "Ramesh Kumar", city: "Chhindwara", area: "Gandhi Ganj", bio: "घर की plumbing और leak repair का demo service provider", experienceYears: 6, startingPrice: 299, categories: ["Plumber"] },
      { phone: "+919999990002", name: "Suresh Patel", city: "Chhindwara", area: "Parasia Road", bio: "Wiring, fan और switch repair का demo service provider", experienceYears: 8, startingPrice: 349, categories: ["Electrician"] },
      { phone: "+919999990003", name: "Asha Verma", city: "Chhindwara", area: "Narsinghpur Road", bio: "Furniture repair और carpentry का demo service provider", experienceYears: 5, startingPrice: 399, categories: ["Carpenter"] },
    ];

    for (const demo of demoProviders) {
      const user = await prisma.user.upsert({
        where: { phone: demo.phone },
        update: { role: "PROVIDER", name: demo.name, city: demo.city, area: demo.area },
        create: { phone: demo.phone, role: "PROVIDER", name: demo.name, city: demo.city, area: demo.area },
      });
      const categoryRecords = await prisma.category.findMany({
        where: { name: { in: demo.categories } },
        select: { id: true },
      });
      await prisma.providerProfile.upsert({
        where: { userId: user.id },
        update: {
          bio: demo.bio, experienceYears: demo.experienceYears, startingPrice: demo.startingPrice,
          serviceArea: demo.area, verification: "APPROVED", availability: "AVAILABLE",
          services: { deleteMany: {}, create: categoryRecords.map((category) => ({ categoryId: category.id })) },
        },
        create: {
          userId: user.id, bio: demo.bio, experienceYears: demo.experienceYears, startingPrice: demo.startingPrice,
          serviceArea: demo.area, verification: "APPROVED", availability: "AVAILABLE",
          services: { create: categoryRecords.map((category) => ({ categoryId: category.id })) },
        },
      });
    }
    console.log("Demo providers seeded. Login OTP for these sample accounts is 123456.");
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
