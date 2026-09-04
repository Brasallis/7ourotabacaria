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
    const colors = Array.isArray(body.colors)
      ? body.colors.map((c: any) => String(c).trim()).filter(Boolean)
      : undefined;
    const sizes = Array.isArray(body.sizes)
      ? body.sizes.map((s: any) => String(s).trim()).filter(Boolean)
      : undefined;
    const models = Array.isArray(body.models)
      ? body.models.map((m: any) => String(m).trim()).filter(Boolean)
      : undefined;
    const images = Array.isArray(body.images)
      ? body.images.map((img: any) => String(img).trim()).filter(Boolean)
      : undefined;

    const updateData: any = {
      name: body.name,
      description: body.description,
      price: parsePrice(body.price) || 0,
      promotionalPrice: parsePrice(body.promotionalPrice),
      imageUrl: (images && images[0]) || body.imageUrl || null,
      imageUrl2: (images && images[1]) || body.imageUrl2 || null,
      imageUrl3: (images && images[2]) || body.imageUrl3 || null,
      isPromotion: body.isPromotion !== undefined ? body.isPromotion : false,
      isVisible: body.isVisible !== undefined ? body.isVisible : true,
      categoryId: body.categoryId,
    };

    if (colors !== undefined) updateData.colors = colors;
    if (sizes !== undefined) updateData.sizes = sizes;
    if (models !== undefined) updateData.models = models;
    if (images !== undefined) updateData.images = images;
    if (body.variantImages !== undefined) {
      updateData.variantImages = Array.isArray(body.variantImages) ? body.variantImages : [];
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Erro detalhado ao atualizar produto (PUT):", error);
    return NextResponse.json({ error: error?.message || "Failed to update product" }, { status: 500 });
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
