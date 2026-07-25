"use client";

import Link from "next/link";
import styles from "./layout.module.css";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className="gold-text">7 OURO</span> ADMIN
        </div>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navLink}>Dashboard</Link>
          <Link href="/admin/categorias" className={styles.navLink}>Categorias</Link>
          <Link href="/admin/produtos" className={styles.navLink}>Produtos</Link>
          <Link href="/admin/cupons" className={styles.navLink}>Cupons</Link>
          
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/" className={styles.navLink}>Voltar para Loja</Link>
            <button 
              onClick={handleLogout} 
              style={{ background: 'transparent', border: 'none', color: '#ff4d4f', textAlign: 'left', padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
              className={styles.navLink}
            >
              Sair
            </button>
          </div>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
