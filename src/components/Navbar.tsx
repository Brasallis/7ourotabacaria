"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { ShoppingCart, Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import styles from "../app/page.module.css";

export default function Navbar() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const fetchResults = async () => {
        try {
          const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
            setShowResults(true);
          }
        } catch (error) {
          console.error("Error searching products", error);
        }
      };
      // Debounce simple
      const timeoutId = setTimeout(fetchResults, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/catalogo?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAddressClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("localizacao");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#localizacao");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image 
            src="/Logo.png" 
            alt="7 Ouro Logo" 
            width={50} 
            height={50} 
            style={{ borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-primary)' }}
          />
          <span><span className="gold-text">7 OURO</span> TABACARIA</span>
        </Link>
      </div>
      
      <div 
        ref={searchRef}
        className={styles.searchContainer}
      >
        <form 
          onSubmit={handleSearchSubmit} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            padding: '5px 15px',
          }}
        >
          <Search size={20} color="var(--gold-primary)" style={{ marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              color: 'var(--text-primary)',
              width: '100%',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
        </form>
        
        {showResults && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '10px',
            background: '#111111',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {searchResults.map(product => (
              <div 
                key={product.id}
                onClick={() => {
                  setShowResults(false);
                  setSearchQuery(""); // clear after selection if desired, or keep it
                  router.push(`/catalogo?q=${encodeURIComponent(product.name)}`);
                }}
                style={{
                  padding: '10px 15px',
                  borderBottom: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold' }}>{product.name}</span>
                  <span className="gold-text" style={{ fontSize: '0.9rem' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.promotionalPrice || product.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {/* Botão de Endereço / Localização */}
        <button
          onClick={handleAddressClick}
          title="7 Ouro Tabacaria | Tabacaria no Km18 (Av. Hildebrando de Lima, 345 - Km 18, Osasco)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--gold-primary)',
            color: 'var(--gold-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <MapPin size={16} color="var(--gold-primary)" />
          <span className={styles.addressLabel}>Como Chegar</span>
        </button>

        <a
          href="https://www.instagram.com/seteourotabacaria/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.navLink}
          title="Instagram @seteourotabacaria"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold-primary)' }}>
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
        </a>
        <Link 
          href="/catalogo" 
          className={styles.navLink}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Catálogo
        </Link>
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
