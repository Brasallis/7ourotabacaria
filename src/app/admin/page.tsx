import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./layout.module.css";

export const revalidate = 0; // Para garantir que os dados estejam sempre atualizados

export default async function AdminDashboard() {
  const [totalProducts, totalCategories, totalCoupons, hiddenProducts] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.promoCode.count(),
    prisma.product.count({ where: { isVisible: false } }),
  ]);

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
        Visão <span className="gold-text">Geral</span>
      </h1>
      
      {/* Indicadores / Informações Simples */}
      <div className={styles.summaryGrid}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--gold-primary)', margin: 0 }}>{totalProducts}</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>Produtos na Base</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--gold-primary)', margin: 0 }}>{totalCategories}</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>Categorias</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--gold-primary)', margin: 0 }}>{totalCoupons}</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>Cupons Ativos</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderColor: hiddenProducts > 0 ? '#ff4d4f' : 'var(--glass-border)' }}>
          <h3 style={{ fontSize: '2.5rem', color: hiddenProducts > 0 ? '#ff4d4f' : 'var(--gold-primary)', margin: 0 }}>{hiddenProducts}</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>Produtos Ocultos</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Atalhos Rápidos</h2>
      
      {/* Atalhos */}
      <div className={styles.autoGrid}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>📦 Produtos</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Cadastre novos itens, altere preços, gerencie imagens e decida o que exibir ou ocultar na loja.
            </p>
          </div>
          <Link href="/admin/produtos" className="btn-primary" style={{ textAlign: 'center' }}>
            Gerenciar Produtos
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>🗂️ Categorias</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Organize sua loja criando ou editando setores (ex: Sedas, Charutos, Acessórios).
            </p>
          </div>
          <Link href="/admin/categorias" className="btn-primary" style={{ textAlign: 'center' }}>
            Gerenciar Categorias
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>🎟️ Cupons</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Crie códigos de desconto exclusivos para campanhas no WhatsApp ou Instagram.
            </p>
          </div>
          <Link href="/admin/cupons" className="btn-primary" style={{ textAlign: 'center' }}>
            Gerenciar Cupons
          </Link>
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--gold-primary)', background: 'rgba(212, 175, 55, 0.05)' }}>
          <div>
            <h2 style={{ color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>🏬 Ver a Loja</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Acesse a página inicial da sua loja como um cliente para ver as atualizações em tempo real.
            </p>
          </div>
          <Link href="/" className="btn-secondary" style={{ textAlign: 'center' }}>
            Acessar Vitrine
          </Link>
        </div>
      </div>
    </div>
  );
}
