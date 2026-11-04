import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";

export async function GET() {
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value);
  if (!session) return NextResponse.json({ok:false,message:"पहले login करें।"},{status:401});
  const user = await prisma.user.findUnique({where:{id:session.userId},select:{id:true,role:true,providerProfile:{select:{id:true,verification:true}}}});
  if (!user || user.role !== "PROVIDER" || !user.providerProfile) return NextResponse.json({ok:false,message:"Provider account आवश्यक है।"},{status:403});
  if (user.providerProfile.verification !== "APPROVED") return NextResponse.json({ok:false,message:"आपकी provider profile अभी admin approval की प्रतीक्षा में है।"},{status:403});
  const bookings = await prisma.booking.findMany({
    where:{providerId:user.providerProfile.id},
    orderBy:{createdAt:"desc"},take:100,
    select:{id:true,description:true,scheduledAt:true,status:true,createdAt:true,
      category:{select:{name:true,icon:true}},
      customer:{select:{name:true,phone:true}},
      address:{select:{label:true,line1:true,city:true,area:true}},
      statusHistory:{orderBy:{createdAt:"asc"},select:{status:true,note:true,createdAt:true}}
    }
  });
  return NextResponse.json({ok:true,bookings});
}
