import styles from "./page.module.css";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

// Adicionar flag de revalidação para que a home atualize sempre (ou usar cache com tempo)
export const revalidate = 0;

export default async function Home() {
  // Busca até 6 produtos que sejam destaques (isPromotion) ou que tenham desconto
  const promoProducts = await prisma.product.findMany({
    where: { 
      isVisible: true,
      OR: [
        { isPromotion: true },
        { promotionalPrice: { not: null } }
      ]
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // Busca todos os outros produtos para a vitrine principal
  const allProducts = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
  });

  // Busca as categorias para exibir no menu inicial
  const categories = await prisma.category.findMany();

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            A Experiência <span className="gold-text">Premium</span> em Tabacaria
          </h1>
          <p className={styles.subtitle}>
            Explore nossa seleção exclusiva de produtos com a melhor qualidade e entrega garantida.
          </p>
          <div className={styles.actions} style={{ flexWrap: 'wrap' }}>
            <Link href="/catalogo" className="btn-primary">
              Todas
            </Link>
            {categories.map(cat => (
              <Link 
                key={cat.id} 
                href={`/catalogo?cat=${cat.id}`} 
                className="btn-secondary"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="promocoes" className={styles.promotions}>
        <h2 className={styles.sectionTitle}>
          Destaques e <span className="gold-text">Promoções</span>
        </h2>
        
        <div className={styles.grid}>
          {promoProducts.length > 0 ? (
            promoProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center' }}>
              Nenhuma promoção no momento. Fique de olho!
            </p>
          )}
        </div>
      </section>

      <section id="todos-produtos" className={styles.promotions} style={{ paddingTop: '2rem' }}>
        <h2 className={styles.sectionTitle}>
          Todos os <span className="gold-text">Produtos</span>
        </h2>
        
        <div className={styles.grid}>
          {allProducts.length > 0 ? (
            allProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center' }}>
              Nenhum produto cadastrado no momento.
            </p>
          )}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/catalogo" className="btn-primary">
            Ver Catálogo Completo
          </Link>
        </div>
      </section>
    </main>
  );
}
