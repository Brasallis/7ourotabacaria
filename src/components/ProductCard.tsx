"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import styles from "../app/page.module.css";
import Image from "next/image";

type VariantImage = {
  url: string;
  color?: string;
  colorHex?: string;
  size?: string;
  model?: string;
};

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
    images?: string[];
    variantImages?: any;
    colors?: string[];
    sizes?: string[];
    models?: string[];
  };
};

// Paleta inteligente de fallback caso uma cor cadastrada antiga não tenha hex do pincel
const COLOR_FALLBACK_MAP: Record<string, string> = {
  preto: "#121212",
  black: "#121212",
  branco: "#FFFFFF",
  white: "#FFFFFF",
  dourado: "#D4AF37",
  ouro: "#D4AF37",
  gold: "#D4AF37",
  prata: "#C0C0C0",
  silver: "#C0C0C0",
  cinza: "#6B7280",
  gray: "#6B7280",
  vermelho: "#DC2626",
  red: "#DC2626",
  rosa: "#EC4899",
  pink: "#EC4899",
  azul: "#2563EB",
  blue: "#2563EB",
  verde: "#16A34A",
  green: "#16A34A",
  amarelo: "#EAB308",
  yellow: "#EAB308",
  laranja: "#F97316",
  orange: "#F97316",
  roxo: "#9333EA",
  purple: "#9333EA",
  lilas: "#C084FC",
  marrom: "#78350F",
  brown: "#78350F",
  bronze: "#CD7F32",
  rose: "#FB7185",
  bege: "#D4C5B9",
};

function getColorHex(colorName: string, variantHex?: string): string {
  if (variantHex && variantHex.startsWith("#")) return variantHex;
  const normalized = colorName.trim().toLowerCase();
  for (const [key, val] of Object.entries(COLOR_FALLBACK_MAP)) {
    if (normalized.includes(key)) return val;
  }
  return "#D4AF37"; // Padrão dourado da 7 Ouro
}

function isColorLight(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // Consolidação de todas as imagens disponíveis
  const allImages: string[] = (product.images && product.images.length > 0)
    ? product.images
    : [product.imageUrl, product.imageUrl2, product.imageUrl3].filter(Boolean) as string[];

  const variantImages: VariantImage[] = Array.isArray(product.variantImages)
    ? product.variantImages
    : [];

  // Helper para obter a URL da imagem de variação
  const getVariantUrl = (vi: any) => vi?.url || vi?.imageUrl || "";

  // FILTRO ESTRITO: Apenas cores que possuam PELO MENOS UMA foto vinculada
  const activeColors = (product.colors || []).filter((c) =>
    variantImages.some(
      (vi) => vi.color && vi.color.trim().toLowerCase() === c.trim().toLowerCase()
    )
  );

  // Cor selecionada (padrão na 1ª opção ativa)
  const [selectedColor, setSelectedColor] = useState<string>(activeColors[0] || "");

  // Imagem inicial: se a 1ª opção ativa tiver foto vinculada, exibe ela; caso contrário, a capa principal
  const initialImage = (() => {
    if (activeColors[0] && variantImages.length > 0) {
      const match = variantImages.find(
        (vi) => vi.color?.toLowerCase() === activeColors[0].toLowerCase()
      );
      const url = getVariantUrl(match);
      if (url) return url;
    }
    return allImages[0] || product.imageUrl || "";
  })();

  const [currentImage, setCurrentImage] = useState<string>(initialImage);
  const [imageAnimating, setImageAnimating] = useState(false);

  const triggerImageSwitch = (newUrl: string) => {
    if (!newUrl || newUrl === currentImage) return;
    setImageAnimating(true);
    setCurrentImage(newUrl);
    setTimeout(() => setImageAnimating(false), 250);
  };

  // Ao clicar em uma amostra de cor: seleciona a cor e busca a foto correspondente instantaneamente
  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    const matched = variantImages.find(
      (vi) => vi.color && vi.color.trim().toLowerCase() === color.trim().toLowerCase()
    );
    const url = getVariantUrl(matched);
    if (url) {
      triggerImageSwitch(url);
    }
  };

  // Ao clicar em uma miniatura: troca a foto e sincroniza a cor caso a foto esteja vinculada
  const handleSelectThumbnail = (imgUrl: string) => {
    triggerImageSwitch(imgUrl);
    const matched = variantImages.find((vi) => getVariantUrl(vi) === imgUrl);
    if (matched?.color && activeColors.includes(matched.color)) {
      setSelectedColor(matched.color);
    }
  };

  const hasDiscount = Boolean(
    product.promotionalPrice &&
    product.promotionalPrice > 0 &&
    product.price > product.promotionalPrice
  );

  const handleAddToCart = () => {
    const currentPrice = hasDiscount && product.promotionalPrice ? product.promotionalPrice : product.price;
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: currentPrice,
      imageUrl: currentImage || allImages[0] || product.imageUrl || undefined,
      selectedColor: selectedColor || undefined,
    });

    // Feedback visual
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className={`glass-panel ${styles.productCard}`}>
      {/* Imagem Principal */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '220px',
        backgroundColor: '#0a0a0a',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {currentImage ? (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            opacity: imageAnimating ? 0.6 : 1,
            transform: imageAnimating ? 'scale(0.97)' : 'scale(1)',
            transition: 'opacity 0.25s ease, transform 0.25s ease'
          }}>
            <Image
              src={currentImage}
              alt={product.name}
              fill
              unoptimized
              style={{ objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Sem Imagem</div>
        )}

        {hasDiscount && product.promotionalPrice ? (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--accent-red)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.75rem',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 20,
            border: '1px solid #fff'
          }}>
            <span>🔥</span>
            {Math.round(((product.price - product.promotionalPrice) / product.price) * 100)}% OFF
          </div>
        ) : null}
      </div>

      {/* Galeria de Miniaturas com Amostras de Cor */}
      {allImages.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.6rem 0.8rem',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid var(--glass-border)',
          overflowX: 'auto',
          justifyContent: allImages.length <= 4 ? 'center' : 'flex-start'
        }}>
          {allImages.map((imgUrl, idx) => {
            const matchedVar = variantImages.find((vi) => getVariantUrl(vi) === imgUrl);
            const isSelected = currentImage === imgUrl;
            const swatchHex = matchedVar?.color
              ? getColorHex(matchedVar.color, matchedVar.colorHex)
              : undefined;

            return (
              <div
                key={idx}
                onClick={() => handleSelectThumbnail(imgUrl)}
                style={{
                  width: '44px',
                  height: '44px',
                  flexShrink: 0,
                  position: 'relative',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: isSelected ? '2px solid var(--gold-primary)' : '1px solid var(--glass-border)',
                  boxShadow: isSelected ? '0 0 10px rgba(212, 175, 55, 0.4)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: isSelected ? 1 : 0.6
                }}
                title={matchedVar?.color ? `Cor: ${matchedVar.color}` : `Foto ${idx + 1}`}
              >
                <Image
                  src={imgUrl}
                  alt={`Miniatura ${idx + 1}`}
                  fill
                  unoptimized
                  style={{ objectFit: 'cover' }}
                />
                {matchedVar?.color && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    padding: '1px 2px'
                  }}>
                    {swatchHex && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: swatchHex,
                        border: '0.5px solid #fff',
                        display: 'inline-block'
                      }} />
                    )}
                    <span style={{
                      color: 'var(--gold-primary)',
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {matchedVar.color}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', flexGrow: 1 }}>
          {product.description}
        </p>

        {/* Amostras Reais de Cor (Visual Color Swatches) */}
        {activeColors.length > 0 && (
          <div style={{
            background: 'linear-gradient(180deg, rgba(22, 22, 22, 0.9) 0%, rgba(12, 12, 12, 0.95) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            padding: '0.75rem 0.85rem',
            marginBottom: '0.85rem',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Header da Cor com Nome em Destaque */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--gold-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.3px' }}>
                <span>🎨</span>
                <span>Cor:</span>
                <strong style={{ color: '#fff', fontSize: '0.82rem' }}>{selectedColor}</strong>
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                {activeColors.length} {activeColors.length === 1 ? 'amostra' : 'amostras'}
              </span>
            </div>

            {/* Círculos com a Amostra Real da Cor Extraída da Foto */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {activeColors.map((c) => {
                const matchedVi = variantImages.find(
                  (vi) => vi.color && vi.color.trim().toLowerCase() === c.trim().toLowerCase()
                );
                const swatchHex = getColorHex(c, matchedVi?.colorHex);
                const isSelected = selectedColor.trim().toLowerCase() === c.trim().toLowerCase();
                const isLight = isColorLight(swatchHex);

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectColor(c)}
                    title={`Cor: ${c} (${swatchHex})`}
                    style={{
                      position: 'relative',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: swatchHex,
                      border: isSelected ? '2px solid #fff' : '1.5px solid rgba(255, 255, 255, 0.25)',
                      outline: isSelected ? '2px solid var(--gold-primary)' : 'none',
                      outlineOffset: isSelected ? '2px' : '0px',
                      boxShadow: isSelected
                        ? `0 0 14px ${swatchHex}aa, 0 0 10px rgba(212, 175, 55, 0.7)`
                        : '0 2px 6px rgba(0,0,0,0.5)',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                    }}
                  >
                    {isSelected && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 900,
                          color: isLight ? '#000' : '#fff',
                          lineHeight: 1,
                          textShadow: isLight ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          {hasDiscount && product.promotionalPrice ? (
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
