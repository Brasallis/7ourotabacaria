"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { ShoppingCart } from "lucide-react";
import styles from "../app/page.module.css";

export default function Navbar() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image 
            src="/Logo.png" 
            alt="7 Ouro Logo" 
            width={50} 
            height={50} 
            style={{ 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '1px solid var(--gold-primary)',
              filter: 'contrast(1.6) saturate(1.4) brightness(0.9)',
              mixBlendMode: 'screen'
            }}
          />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}><span className="gold-text">7 Ouro</span> TABACARIA</span>
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/catalogo" className={styles.navLink}>Catálogo</Link>
        <Link href="/carrinho" className={styles.cartBtn}>
          <ShoppingCart className={styles.cartIcon} />
          {cartCount > 0 && (
            <span className={styles.cartBadge}>{cartCount}</span>
          )}
        </Link>
      </nav>
    </header>
  );
}
