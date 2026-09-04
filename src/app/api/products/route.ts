import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true';
    const q = url.searchParams.get('q');
    
    let products = await prisma.product.findMany({
      where: isAdmin ? {} : { isVisible: true },
      include: {
        category: true,
      }
    });
    
    // Filter in JS to ensure perfect case and accent insensitivity
    if (q) {
      const search = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      products = products.filter(p => 
        p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search)
      );
    }
    
    // Sort alphabetically ignoring case and accents robustly
    products.sort((a, b) => {
      return a.name.trim().replace(/\s+/g, ' ').localeCompare(b.name.trim().replace(/\s+/g, ' '), 'pt-BR', { sensitivity: 'base' });
    });
    
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const colors = Array.isArray(body.colors)
      ? body.colors.map((c: any) => String(c).trim()).filter(Boolean)
      : [];
    const sizes = Array.isArray(body.sizes)
      ? body.sizes.map((s: any) => String(s).trim()).filter(Boolean)
      : [];
    const models = Array.isArray(body.models)
      ? body.models.map((m: any) => String(m).trim()).filter(Boolean)
      : [];
    const images = Array.isArray(body.images)
      ? body.images.map((img: any) => String(img).trim()).filter(Boolean)
      : [body.imageUrl, body.imageUrl2, body.imageUrl3].filter(Boolean);
    const variantImages = Array.isArray(body.variantImages) ? body.variantImages : [];

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: parsePrice(body.price) || 0,
        promotionalPrice: parsePrice(body.promotionalPrice),
        imageUrl: images[0] || body.imageUrl || null,
        imageUrl2: images[1] || body.imageUrl2 || null,
        imageUrl3: images[2] || body.imageUrl3 || null,
        isPromotion: body.isPromotion || false,
        isVisible: body.isVisible !== undefined ? body.isVisible : true,
        categoryId: body.categoryId,
        colors,
        sizes,
        models,
        images,
        variantImages,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Erro detalhado ao criar produto (POST):", error);
    return NextResponse.json({ error: error?.message || "Failed to create product" }, { status: 500 });
  }
}
