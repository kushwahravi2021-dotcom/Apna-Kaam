import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSessionToken, sessionCookieName } from "@/lib/auth";
async function admin(){const c=await cookies();const s=readSessionToken(c.get(sessionCookieName)?.value);if(!s)return false;const u=await prisma.user.findUnique({where:{id:s.userId},select:{role:true}});return u?.role==="ADMIN";}
export async function GET(){if(!(await admin()))return NextResponse.json({ok:false,message:"Admin access required."},{status:403});try{const users=await prisma.user.findMany({orderBy:{createdAt:"desc"},take:200,select:{id:true,name:true,phone:true,email:true,role:true,city:true,area:true,createdAt:true,providerProfile:{select:{verification:true,availability:true}}}});return NextResponse.json({ok:true,users});}catch{return NextResponse.json({ok:false,message:"Users load नहीं हुए।"},{status:503});}}