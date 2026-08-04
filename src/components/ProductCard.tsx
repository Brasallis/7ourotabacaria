"use client";

import { useState } from "react";
import { useCart, CartItem } from "./CartContext";
import styles from "../app/page.module.css";
import Image from "next/image";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    promotionalPrice?: number | null;
    imageUrl?: string | null;
    imageUrl2?: string | null;
    imageUrl3?: string | null;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [currentImage, setCurrentImage] = useState(product.imageUrl);

  const handleAddToCart = () => {
    const currentPrice = product.promotionalPrice || product.price;
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      imageUrl: product.imageUrl || undefined,
    });
    
    // Feedback visual
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className={`glass-panel ${styles.productCard}`}>
      <div style={{ position: 'relative', width: '100%', height: '220px', backgroundColor: '#0a0a0a', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {currentImage || product.imageUrl ? (
          <Image
            src={(currentImage || product.imageUrl) as string}
            alt={product.name}
            fill
            unoptimized
            style={{ objectFit: 'contain', padding: '1rem' }}
          />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Sem Imagem</div>
        )}
        
        {product.promotionalPrice && product.price > product.promotionalPrice && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--gold-gradient)',
            color: '#000',
            padding: '6px 10px',
            borderRadius: '50px',
            fontWeight: '900',
            fontSize: '0.85rem',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 20,
            border: '1px solid #fff'
          }}>
            <span>🔥</span>
            {Math.round(((product.price - product.promotionalPrice) / product.price) * 100)}% OFF
          </div>
        )}
      </div>

      {(product.imageUrl2 || product.imageUrl3) && (
        <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)', justifyContent: 'center' }}>
          <div 
            onClick={() => setCurrentImage(product.imageUrl)}
            style={{ width: '45px', height: '45px', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: currentImage === product.imageUrl ? '2px solid var(--gold-primary)' : '1px solid var(--glass-border)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Image src={product.imageUrl || ''} alt="Thumb 1" fill unoptimized style={{ objectFit: 'cover' }} />
          </div>
          {product.imageUrl2 && (
            <div 
              onClick={() => setCurrentImage(product.imageUrl2)}
              style={{ width: '45px', height: '45px', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: currentImage === product.imageUrl2 ? '2px solid var(--gold-primary)' : '1px solid var(--glass-border)', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Image src={product.imageUrl2} alt="Thumb 2" fill unoptimized style={{ objectFit: 'cover' }} />
            </div>
          )}
          {product.imageUrl3 && (
            <div 
              onClick={() => setCurrentImage(product.imageUrl3)}
              style={{ width: '45px', height: '45px', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: currentImage === product.imageUrl3 ? '2px solid var(--gold-primary)' : '1px solid var(--glass-border)', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Image src={product.imageUrl3} alt="Thumb 3" fill unoptimized style={{ objectFit: 'cover' }} />
            </div>
          )}
        </div>
      )}
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', flexGrow: 1 }}>
          {product.description}
        </p>
        <div style={{ marginBottom: '1rem' }}>
          {product.promotionalPrice ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </span>
              <span className={styles.productPrice}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.promotionalPrice)}
              </span>
            </div>
          ) : (
            <p className={styles.productPrice}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </p>
          )}
        </div>
        <button 
          className="btn-primary" 
          style={{ 
            width: '100%', 
            marginTop: 'auto',
            backgroundColor: isAdded ? '#4CAF50' : '',
            color: isAdded ? '#fff' : '',
            borderColor: isAdded ? '#4CAF50' : '',
            transition: 'all 0.3s ease'
          }} 
          onClick={handleAddToCart}
          disabled={isAdded}
        >
          {isAdded ? "Adicionado ✓" : "Adicionar"}
        </button>
      </div>
    </div>
  );
}
