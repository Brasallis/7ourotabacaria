const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("Deletando dados antigos...");
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("Criando categorias...");
  const catSeda = await prisma.category.create({ data: { name: 'Sedas' } });
  const catTabaco = await prisma.category.create({ data: { name: 'Tabacos' } });
  const catPiteira = await prisma.category.create({ data: { name: 'Piteiras' } });
  const catAcessorios = await prisma.category.create({ data: { name: 'Acessórios' } });

  console.log("Copiando imagens...");
  const sourceDir = 'C:\\Users\\felip\\.gemini\\antigravity-ide\\brain\\ecca2161-0393-4fc8-a7db-7f42c05d2cb0';
  const destDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(sourceDir);
  const images = {};

  for (const file of files) {
    if (file.endsWith('.png')) {
      const baseNameMatch = file.match(/^([a-zA-Z_]+)_\d+\.png$/);
      if (baseNameMatch) {
        const key = baseNameMatch[1];
        const destName = file;
        fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, destName));
        images[key] = `/uploads/${destName}`;
      }
    }
  }

  console.log("Criando produtos...");
  await prisma.product.create({
    data: {
      name: 'Seda Bem Bolado King Size',
      description: 'Seda nacional de alta qualidade, queima lenta e uniforme. Papel fino e natural.',
      price: 6.00,
      imageUrl: images['seda_normal'] || null,
      categoryId: catSeda.id,
      isVisible: true,
      isPromotion: false,
    }
  });

  await prisma.product.create({
    data: {
      name: 'Seda RAW Black King Size',
      description: 'A seda mais fina já feita pela RAW. Papel não branqueado, proporciona uma experiência premium.',
      price: 15.00,
      promotionalPrice: 12.00,
      imageUrl: images['seda_premium'] || null,
      categoryId: catSeda.id,
      isVisible: true,
      isPromotion: true,
    }
  });

  await prisma.product.create({
    data: {
      name: 'Tabaco Natural Original',
      description: 'Tabaco claro, destalado e de intensidade suave. Ideal para o dia a dia.',
      price: 30.00,
      imageUrl: images['tabaco_normal'] || null,
      categoryId: catTabaco.id,
      isVisible: true,
      isPromotion: false,
    }
  });

  await prisma.product.create({
    data: {
      name: 'Tabaco Premium Amsterdam',
      description: 'Blend especial holandês, sabor intenso e sem aditivos químicos. O verdadeiro gosto.',
      price: 45.00,
      promotionalPrice: 35.00,
      imageUrl: images['tabaco_premium'] || null,
      categoryId: catTabaco.id,
      isVisible: true,
      isPromotion: true,
    }
  });

  await prisma.product.create({
    data: {
      name: 'Piteira de Vidro Longa',
      description: 'Piteira de vidro lavável, resfria a fumaça e não deixa cheiro nos dedos.',
      price: 25.00,
      imageUrl: images['piteira_vidro'] || null,
      categoryId: catPiteira.id,
      isVisible: true,
      isPromotion: false,
    }
  });

  await prisma.product.create({
    data: {
      name: 'Piteira de Papel Perfurada',
      description: 'Livreto de piteira de papel perfurada para facilitar a dobra e montagem.',
      price: 5.00,
      promotionalPrice: 4.00,
      imageUrl: images['piteira_papel'] || null,
      categoryId: catPiteira.id,
      isVisible: true,
      isPromotion: true,
    }
  });

  await prisma.product.create({
    data: {
      name: 'Dichavador de Metal 3 Fases',
      description: 'Dichavador super resistente com tela coletora de kief e pazinha inclusa.',
      price: 50.00,
      imageUrl: images['acessorio_dichavador'] || null,
      categoryId: catAcessorios.id,
      isVisible: true,
      isPromotion: false,
    }
  });

  await prisma.product.create({
    data: {
      name: 'Bandeja Metálica Premium',
      description: 'Bandeja grande para organização, com bordas elevadas para evitar desperdícios.',
      price: 70.00,
      promotionalPrice: 55.00,
      imageUrl: images['acessorio_bandeja'] || null,
      categoryId: catAcessorios.id,
      isVisible: true,
      isPromotion: true,
    }
  });

  console.log("Banco de dados populado com sucesso!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
