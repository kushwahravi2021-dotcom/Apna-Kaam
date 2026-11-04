import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";

const schema=z.object({bookingId:z.string().min(1),rating:z.number().int().min(1).max(5),comment:z.string().trim().max(500).optional().default("")});
export async function POST(request:Request){
 const store=await cookies();const session=readSessionToken(store.get(sessionCookieName)?.value);
 if(!session)return NextResponse.json({ok:false,message:"पहले login करें।"},{status:401});
 const user=await prisma.user.findUnique({where:{id:session.userId},select:{id:true,role:true}});
 if(!user||user.role!=="CUSTOMER")return NextResponse.json({ok:false,message:"Customer account required."},{status:403});
 const parsed=schema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({ok:false,message:"Rating 1 से 5 के बीच दें।"},{status:400});
 const {bookingId,rating,comment}=parsed.data;
 try{
  const result=await prisma.$transaction(async tx=>{
   const booking=await tx.booking.findFirst({where:{id:bookingId,customerId:user.id},select:{id:true,providerId:true,status:true,review:{select:{id:true}}}});
   if(!booking)throw new Error("BOOKING_NOT_FOUND");
   if(booking.status!=="COMPLETED")throw new Error("BOOKING_NOT_COMPLETED");
   if(booking.review)throw new Error("REVIEW_EXISTS");
   await tx.review.create({data:{bookingId,customerId:user.id,providerId:booking.providerId,rating,comment}});
   const stats=await tx.review.aggregate({where:{providerId:booking.providerId},_avg:{rating:true},_count:{_all:true}});
   await tx.providerProfile.update({where:{id:booking.providerId},data:{rating:stats._avg.rating||0,reviewCount:stats._count._all}});
   return {rating,reviewCount:stats._count._all};
  });
  return NextResponse.json({ok:true,review:result},{status:201});
 }catch(e){
  const code=e instanceof Error?e.message:"";
  if(code==="BOOKING_NOT_FOUND")return NextResponse.json({ok:false,message:"Booking नहीं मिली।"},{status:404});
  if(code==="BOOKING_NOT_COMPLETED")return NextResponse.json({ok:false,message:"काम पूरा होने के बाद ही rating दे सकते हैं।"},{status:400});
  if(code==="REVIEW_EXISTS")return NextResponse.json({ok:false,message:"इस booking की rating पहले दी जा चुकी है।"},{status:409});
  console.error("Review create error:",e);return NextResponse.json({ok:false,message:"Review save नहीं हो सकी।"},{status:503});
 }
}
