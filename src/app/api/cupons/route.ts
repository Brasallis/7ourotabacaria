import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const coupon = await prisma.promoCode.create({
      data: {
        code: body.code.toUpperCase().trim(),
        discountPercentage: parseFloat(body.discountPercentage),
        active: body.active !== undefined ? body.active : true,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Este código já existe" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
