import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const parsePrice = (val: any) => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  
  let str = String(val).trim();
  // Se tiver vírgula, é padrão pt-BR: remove pontos de milhar e troca vírgula por ponto
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  }
  // Se não tiver vírgula, assume que é ponto decimal normal.
  
  // Remove qualquer letra ou caractere invisível que possa causar erro
  str = str.replace(/[^0-9.-]/g, '');
  return parseFloat(str) || 0;
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: parsePrice(body.price) || 0,
        promotionalPrice: parsePrice(body.promotionalPrice),
        imageUrl: body.imageUrl || null,
        imageUrl2: body.imageUrl2 || null,
        imageUrl3: body.imageUrl3 || null,
        isPromotion: body.isPromotion !== undefined ? body.isPromotion : false,
        isVisible: body.isVisible !== undefined ? body.isVisible : true,
        categoryId: body.categoryId,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
