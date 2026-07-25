import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = body.code?.toUpperCase().trim();

    if (!code) {
      return NextResponse.json({ error: "Código não fornecido" }, { status: 400 });
    }

    const coupon = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Cupom inválido" }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ error: "Este cupom não está mais ativo" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      discountPercentage: coupon.discountPercentage,
      code: coupon.code,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao validar cupom" }, { status: 500 });
  }
}
