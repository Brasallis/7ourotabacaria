import styles from "./page.module.css";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

// Adicionar flag de revalidação e forçar dinâmico para evitar cache preso na Vercel
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
  // Busca até 6 produtos que sejam destaques (isPromotion) ou que tenham desconto
  // Busca produtos que sejam destaques (isPromotion) ou que tenham desconto
  const promoProducts = await prisma.product.findMany({
    where: { 
      isVisible: true,
      OR: [
        { isPromotion: true },
        { promotionalPrice: { not: null } }
      ]
    }
  });
  promoProducts.sort((a, b) => {
    return a.name.trim().replace(/\s+/g, ' ').localeCompare(b.name.trim().replace(/\s+/g, ' '), 'pt-BR', { sensitivity: 'base' });
  });
  
  // Pega os 6 primeiros da lista já ordenada alfabeticamente
  const topPromoProducts = promoProducts.slice(0, 6);

  // Busca todos os outros produtos para a vitrine principal
  const allProducts = await prisma.product.findMany({
    where: { isVisible: true },
  });
  allProducts.sort((a, b) => {
    return a.name.trim().replace(/\s+/g, ' ').localeCompare(b.name.trim().replace(/\s+/g, ' '), 'pt-BR', { sensitivity: 'base' });
  });

  // Busca as categorias para exibir no menu inicial
  const categories = await prisma.category.findMany();
  categories.sort((a, b) => {
    return a.name.trim().replace(/\s+/g, ' ').localeCompare(b.name.trim().replace(/\s+/g, ' '), 'pt-BR', { sensitivity: 'base' });
  });

  return (
    <main className={styles.main}>
      {/* Efeito Parallax: Fagulhas presas no fundo da tela */}
      <div className="embers-wrap">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`ember ember-${i + 1}`}></div>
        ))}
      </div>

      <section className={styles.hero} style={{ position: 'relative', zIndex: 1 }}>
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

      <section id="promocoes" className={styles.promotions} style={{ position: 'relative', zIndex: 1 }}>
        <h2 className={styles.sectionTitle}>
          Destaques e <span className="gold-text">Promoções</span>
        </h2>
        
        <div className={styles.grid}>
          {topPromoProducts.length > 0 ? (
            topPromoProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center' }}>
              Nenhuma promoção no momento. Fique de olho!
            </p>
          )}
        </div>
      </section>

      {/* Camada sólida que passa por cima das fagulhas */}
      <section id="todos-produtos" className={styles.promotions} style={{ paddingTop: '2rem', backgroundColor: 'var(--bg-primary)', position: 'relative', zIndex: 10, paddingBottom: '3rem' }}>
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
