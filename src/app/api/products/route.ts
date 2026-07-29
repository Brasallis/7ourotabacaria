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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true';
    const q = url.searchParams.get('q');
    
    const whereClause: any = isAdmin ? {} : { isVisible: true };
    if (q) {
      whereClause.name = { contains: q }; // sqlite doesn't support mode: 'insensitive' natively in prisma unless configured, but we'll try contains. Note: SQLite contains is case-insensitive by default in Prisma.
    }
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc'
      }
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
