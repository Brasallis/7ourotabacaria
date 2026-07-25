import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // 1. Essências
  const catEssencias = await prisma.category.create({
    data: { name: 'Essências' }
  })
  
  await prisma.product.createMany({
    data: [
      {
        name: 'Zomo Strong Mint',
        description: 'Menta extremamente gelada e forte. 50g.',
        price: 15.90,
        imageUrl: 'https://images.unsplash.com/photo-1579730536417-063a8a07c08a?auto=format&fit=crop&q=80&w=400',
        categoryId: catEssencias.id
      },
      {
        name: 'Nay Spelled',
        description: 'Melão com um toque de menta. 50g.',
        price: 18.50,
        imageUrl: 'https://images.unsplash.com/photo-1627429188487-eb4a4d6b6f7a?auto=format&fit=crop&q=80&w=400',
        categoryId: catEssencias.id
      },
      {
        name: 'Smyrna Love',
        description: 'Sabor adocicado e refrescante. 50g.',
        price: 16.00,
        imageUrl: 'https://images.unsplash.com/photo-1611762514333-e18eab11b33b?auto=format&fit=crop&q=80&w=400',
        categoryId: catEssencias.id
      }
    ]
  })

  // 2. Narguilés
  const catNarguiles = await prisma.category.create({
    data: { name: 'Narguilés' }
  })

  await prisma.product.createMany({
    data: [
      {
        name: 'Narguilé Zeus Smart',
        description: 'Setup completo dourado e preto premium.',
        price: 499.90,
        imageUrl: 'https://images.unsplash.com/photo-1549429486-74fc21941655?auto=format&fit=crop&q=80&w=400',
        categoryId: catNarguiles.id
      },
      {
        name: 'Triton Zip',
        description: 'Narguilé pequeno com ótimo fluxo.',
        price: 250.00,
        imageUrl: 'https://images.unsplash.com/photo-1527092100806-a88e9986bbd7?auto=format&fit=crop&q=80&w=400',
        categoryId: catNarguiles.id
      },
      {
        name: 'Mani Sultan',
        description: 'Edição Heróis com rosh e prato personalizados.',
        price: 650.00,
        imageUrl: 'https://images.unsplash.com/photo-1563820986701-ce10ab2e76f5?auto=format&fit=crop&q=80&w=400',
        categoryId: catNarguiles.id
      }
    ]
  })

  // 3. Acessórios & Carvão
  const catAcessorios = await prisma.category.create({
    data: { name: 'Acessórios & Carvão' }
  })

  await prisma.product.createMany({
    data: [
      {
        name: 'Carvão Art Coco (1kg)',
        description: 'Carvão de fibra de coco, não deixa gosto.',
        price: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1601007274092-23c21c7849e7?auto=format&fit=crop&q=80&w=400',
        categoryId: catAcessorios.id
      },
      {
        name: 'Papel Alumínio Predator',
        description: '50 folhas de alumínio grosso para Rosh.',
        price: 25.90,
        imageUrl: 'https://images.unsplash.com/photo-1616422285623-138924eb611a?auto=format&fit=crop&q=80&w=400',
        categoryId: catAcessorios.id
      },
      {
        name: 'Pegador Dourado Premium',
        description: 'Pegador de carvão grande com ponta fina.',
        price: 35.00,
        imageUrl: 'https://images.unsplash.com/photo-1581452414777-63a233b4737d?auto=format&fit=crop&q=80&w=400',
        categoryId: catAcessorios.id
      }
    ]
  })

  console.log('Seed executado com sucesso! Categorias e Produtos iniciais criados.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
