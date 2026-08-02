import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true,
      },
    });
    
    // Garantir ordem alfabética precisa e imune a maiúsculas/acentos para as Categorias e Produtos
    categories.sort((a, b) => {
      return a.name.trim().replace(/\s+/g, ' ').localeCompare(b.name.trim().replace(/\s+/g, ' '), 'pt-BR', { sensitivity: 'base' });
    });

    categories.forEach(cat => {
      if (cat.products) {
        cat.products.sort((a, b) => {
          return a.name.trim().replace(/\s+/g, ' ').localeCompare(b.name.trim().replace(/\s+/g, ' '), 'pt-BR', { sensitivity: 'base' });
        });
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = await prisma.category.create({
      data: {
        name: body.name,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
