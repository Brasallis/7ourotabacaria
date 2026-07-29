import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const parsePrice = (val: any) => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned);
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true';
    
    const products = await prisma.product.findMany({
      where: isAdmin ? {} : { isVisible: true },
      include: {
        category: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: parsePrice(body.price) || 0,
        promotionalPrice: parsePrice(body.promotionalPrice),
        imageUrl: body.imageUrl || null,
        imageUrl2: body.imageUrl2 || null,
        imageUrl3: body.imageUrl3 || null,
        isPromotion: body.isPromotion || false,
        isVisible: body.isVisible !== undefined ? body.isVisible : true,
        categoryId: body.categoryId,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
