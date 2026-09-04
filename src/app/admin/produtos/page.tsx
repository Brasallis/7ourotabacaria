"use client";

import { useState, useEffect } from "react";
import styles from "../layout.module.css";
import ImageCropper from "@/components/ImageCropper";
import ColorEyedropperModal from "@/components/ColorEyedropperModal";

type Category = {
  id: string;
  name: string;
};

type VariantImage = {
  url: string;
  color?: string;
  colorHex?: string;
  size?: string;
  model?: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice: number | null;
  imageUrl: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  images?: string[];
  variantImages?: VariantImage[];
  colors?: string[];
  sizes?: string[];
  models?: string[];
  isPromotion: boolean;
  isVisible: boolean;
  category: Category;
  categoryId: string;
};

type ImageItem = {
  id: string;
  url: string;
  file: File | null;
  preview: string;
  color?: string;
  colorHex?: string;
};

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    promotionalPrice: "",
    categoryId: "",
    isPromotion: false,
    isVisible: true,
  });

  // Dynamic image list with variant linking
  const [imagesList, setImagesList] = useState<ImageItem[]>([]);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [currentCropTargetId, setCurrentCropTargetId] = useState<string | null>(null);
  const [eyedropperTarget, setEyedropperTarget] = useState<ImageItem | null>(null);

  // Variations (Exclusivamente Cores)
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([
      fetch("/api/products?admin=true"),
      fetch("/api/categories")
    ]);
    if (prodRes.ok) setProducts(await prodRes.json());
    if (catRes.ok) setCategories(await catRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Multi-image selection
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: ImageItem[] = [];
      Array.from(e.target.files).forEach((file) => {
        newItems.push({
          id: `new-${Date.now()}-${Math.random()}`,
          url: "",
          file,
          preview: URL.createObjectURL(file),
          color: "",
          colorHex: undefined,
        });
      });
      setImagesList((prev) => [...prev, ...newItems]);
      e.target.value = "";
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    if (currentCropTargetId) {
      setImagesList((prev) =>
        prev.map((img) =>
          img.id === currentCropTargetId
            ? { ...img, file: croppedFile, preview: URL.createObjectURL(croppedFile) }
            : img
        )
      );
    }
    setCropImageSrc(null);
    setCurrentCropTargetId(null);
  };

  const removeImage = (id: string) => {
    setImagesList((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    setImagesList((prev) => {
      const newList = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newList.length) return prev;
      const temp = newList[index];
      newList[index] = newList[targetIndex];
      newList[targetIndex] = temp;
      return newList;
    });
  };

  const updateImageColor = (id: string, color: string) => {
    setImagesList((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          // Se a cor for alterada para outra que já tem um hex conhecido no produto, podemos vincular
          return { ...img, color };
        }
        return img;
      })
    );
  };

  // Tags management (apenas cores)
  const addColorTag = () => {
    const val = colorInput.trim();
    if (val && !colors.includes(val)) {
      setColors([...colors, val]);
      setColorInput("");
    }
  };

  const removeColorTag = (index: number) => {
    const removed = colors[index];
    setColors(colors.filter((_, i) => i !== index));
    // Desvincular fotos ligadas à cor removida
    setImagesList((prev) =>
      prev.map((img) => (img.color === removed ? { ...img, color: "" } : img))
    );
  };

  const uploadSingleFile = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
    if (uploadRes.ok) {
      const { url } = await uploadRes.json();
      return url;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload any new image files in order and build variantImages mapping
      const finalImageUrls: string[] = [];
      const variantImages: VariantImage[] = [];

      for (const item of imagesList) {
        let url = item.url;
        if (item.file) {
          const uploadedUrl = await uploadSingleFile(item.file);
          if (uploadedUrl) url = uploadedUrl;
        }
        if (url) {
          finalImageUrls.push(url);
          variantImages.push({
            url,
            color: item.color || undefined,
            colorHex: item.colorHex || undefined,
          });
        }
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/products/${editingId}` : "/api/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl: finalImageUrls[0] || null,
          imageUrl2: finalImageUrls[1] || null,
          imageUrl3: finalImageUrls[2] || null,
          images: finalImageUrls,
          variantImages,
          colors,
          sizes: [],
          models: [],
        }),
      });

      if (res.ok) {
        handleCancel();
        fetchData();
      } else {
        alert("Erro ao salvar produto");
      }
    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prod: Product) => {
    setEditingId(prod.id);
    setShowForm(true);
    setFormData({
      name: prod.name,
      description: prod.description,
      price: prod.price ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(prod.price) : "",
      promotionalPrice: prod.promotionalPrice ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(prod.promotionalPrice) : "",
      categoryId: prod.categoryId,
      isPromotion: prod.isPromotion || false,
      isVisible: prod.isVisible !== undefined ? prod.isVisible : true,
    });

    // Variations (Apenas Cores)
    setColors(prod.colors || []);
    setColorInput("");

    // Variant images lookup
    const variantMap: Record<string, { color?: string; colorHex?: string }> = {};
    if (Array.isArray(prod.variantImages)) {
      prod.variantImages.forEach((vi: any) => {
        const u = vi.url || vi.imageUrl;
        if (u) {
          variantMap[u] = { color: vi.color, colorHex: vi.colorHex };
        }
      });
    }

    // Images
    const rawImages = (prod.images && prod.images.length > 0)
      ? prod.images
      : [prod.imageUrl, prod.imageUrl2, prod.imageUrl3].filter(Boolean) as string[];

    setImagesList(
      rawImages.map((url, idx) => ({
        id: `existing-${idx}-${url}`,
        url,
        file: null,
        preview: url,
        color: variantMap[url]?.color || "",
        colorHex: variantMap[url]?.colorHex || undefined,
      }))
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({ name: "", description: "", price: "", promotionalPrice: "", categoryId: "", isPromotion: false, isVisible: true });
    setColors([]);
    setColorInput("");
    setImagesList([]);
    setCropImageSrc(null);
    setCurrentCropTargetId(null);
    setEyedropperTarget(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    setLoading(true);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
    else alert("Erro ao excluir");
    setLoading(false);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatCurrencyInput = (value: string) => {
    let numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    const floatValue = parseFloat(numericValue) / 100;
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(floatValue);
  };

  return (
    <div>
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropImageSrc(null);
            setCurrentCropTargetId(null);
          }}
        />
      )}

      {eyedropperTarget && (
        <ColorEyedropperModal
          imageSrc={eyedropperTarget.preview}
          initialColorName={eyedropperTarget.color}
          initialColorHex={eyedropperTarget.colorHex || "#D4AF37"}
          availableColors={colors}
          onConfirm={({ colorName, colorHex }) => {
            setImagesList((prev) =>
              prev.map((img) =>
                img.id === eyedropperTarget.id
                  ? { ...img, color: colorName, colorHex }
                  : img
              )
            );
            if (colorName && !colors.includes(colorName)) {
              setColors((prev) => [...prev, colorName]);
            }
            setEyedropperTarget(null);
          }}
          onCancel={() => setEyedropperTarget(null)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>
          Gerenciar <span className="gold-text">Produtos</span>
        </h1>

        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Novo Produto
          </button>
        )}
      </div>

      {showForm && (
        <form className={styles.adminForm} onSubmit={handleSubmit}>
          <div className={styles.grid3}>
            <div className={styles.formGroup}>
              <label>Nome do Produto</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Preço Original (R$)</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: formatCurrencyInput(e.target.value) })}
                placeholder="0,00"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label style={{ color: 'var(--gold-light)' }}>Preço Promocional (Opcional)</label>
              <input
                type="text"
                value={formData.promotionalPrice}
                onChange={(e) => setFormData({ ...formData, promotionalPrice: formatCurrencyInput(e.target.value) })}
                placeholder="Ex: Se tiver desconto"
              />
              {formData.price && formData.promotionalPrice && (
                (() => {
                  const p = parseFloat(formData.price.replace(/\./g, '').replace(',', '.'));
                  const pPromo = parseFloat(formData.promotionalPrice.replace(/\./g, '').replace(',', '.'));
                  if (p > pPromo && pPromo > 0) {
                    return (
                      <span style={{ color: 'var(--gold-primary)', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 'bold' }}>
                        Desconto de {Math.round(((p - pPromo) / p) * 100)}%
                      </span>
                    );
                  }
                  return null;
                })()
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Categoria</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                style={{ width: '100%' }}
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isPromotion"
                  checked={formData.isPromotion}
                  onChange={(e) => setFormData({ ...formData, isPromotion: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="isPromotion" style={{ margin: 0, cursor: 'pointer', color: 'var(--gold-primary)' }}>
                  ⭐ Destacar na Vitrine
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="isVisible" style={{ margin: 0, cursor: 'pointer', color: formData.isVisible ? '#4CAF50' : 'var(--text-secondary)' }}>
                  👁️ {formData.isVisible ? "Exibindo na Loja" : "Oculto na Loja"}
                </label>
              </div>
            </div>
          </div>

          {/* Section: Variação Exclusiva - Cores do Produto */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '14px',
            padding: '1.5rem',
            margin: '2rem 0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
                <span>🎨</span> Cores do Produto ({colors.length})
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Cadastre os nomes das cores disponíveis abaixo. Em seguida, na galeria de fotos, use o <strong>Pincel 🖌️</strong> para extrair a cor real de cada foto e exibi-la como amostra visual na loja!
              </p>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderTop: '3px solid var(--gold-primary)',
              borderRadius: '10px',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px' }}>
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addColorTag();
                    }
                  }}
                  placeholder="Ex: Dourado, Preto Fosco, Rosa Choque, Vermelho"
                  style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  onClick={addColorTag}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', fontWeight: 'bold' }}
                  title="Adicionar cor"
                >
                  + Adicionar Cor
                </button>
              </div>

              {/* Lista de cores cadastradas com indicador de hex amostrado */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', minHeight: '36px', alignItems: 'center' }}>
                {colors.map((c, idx) => {
                  const linkedItem = imagesList.find((img) => img.color === c && img.colorHex);
                  return (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid var(--gold-primary)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                      }}
                    >
                      {linkedItem?.colorHex ? (
                        <span
                          title={`Hex: ${linkedItem.colorHex}`}
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            backgroundColor: linkedItem.colorHex,
                            border: '1.5px solid #fff',
                            display: 'inline-block',
                            boxShadow: `0 0 6px ${linkedItem.colorHex}88`
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.8rem' }}>🎨</span>
                      )}
                      <strong>{c}</strong>
                      <button
                        type="button"
                        onClick={() => removeColorTag(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff6b6b',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          padding: 0,
                          lineHeight: 1,
                          marginLeft: '2px'
                        }}
                        title="Remover cor"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
                {colors.length === 0 && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Nenhuma cor cadastrada. Adicione nomes de cores acima ou use o Pincel diretamente em uma foto!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Múltiplas Fotos Dinâmicas com Identificação de Cor por Pincel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--glass-border)',
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
                  <span>📸</span> Galeria de Fotos & Amostras de Cores ({imagesList.length} {imagesList.length === 1 ? 'foto' : 'fotos'})
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  A 1ª foto será a <strong>Capa Principal</strong>. Use o botão <strong>🖌️ Pincel / Cor</strong> em cada foto para extrair e associar a cor exata do produto.
                </p>
              </div>

              <label
                className="btn-primary"
                style={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.65rem 1.3rem',
                  fontSize: '0.9rem',
                  fontWeight: 700
                }}
              >
                <span>+ Adicionar Fotos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onFilesSelected}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {imagesList.length === 0 ? (
              <div style={{
                border: '2px dashed rgba(212, 175, 55, 0.3)',
                borderRadius: '10px',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖼️</div>
                <p style={{ margin: 0, color: '#fff', fontWeight: 600 }}>Nenhuma foto adicionada para este produto.</p>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', opacity: 0.7 }}>Clique no botão dourado <strong>+ Adicionar Fotos</strong> acima para selecionar fotos do seu dispositivo.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1.25rem'
              }}>
                {imagesList.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'linear-gradient(180deg, rgba(25, 25, 25, 0.85) 0%, rgba(12, 12, 12, 0.95) 100%)',
                      borderRadius: '12px',
                      border: index === 0 ? '2px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: index === 0 ? '0 0 18px rgba(212, 175, 55, 0.25)' : '0 4px 12px rgba(0,0,0,0.3)',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Badge da Posição */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: index === 0 ? 'var(--gold-gradient)' : 'rgba(0,0,0,0.85)',
                      color: index === 0 ? '#000' : '#fff',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      zIndex: 2,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                      border: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.15)'
                    }}>
                      {index === 0 ? "⭐ Capa Principal" : `Foto #${index + 1}`}
                    </div>

                    {/* Botão de Excluir Foto (Minimalista e perfeitamente embutido) */}
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      title="Remover foto"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(239, 68, 68, 0.6)',
                        color: '#f87171',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 3,
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.7)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ✕
                    </button>

                    {/* Container da Foto com Badge de Cor Embutido */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '170px',
                      background: '#070707',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <img
                        src={item.preview}
                        alt={`Foto ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />

                      {/* Badge da Cor Vinculada na Foto */}
                      {item.color && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'rgba(0,0,0,0.88)',
                          border: '1px solid var(--gold-primary)',
                          padding: '3px 8px',
                          borderRadius: '16px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.8)',
                          zIndex: 2,
                          backdropFilter: 'blur(4px)'
                        }}>
                          {item.colorHex && (
                            <span style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: item.colorHex,
                              border: '1px solid #fff',
                              display: 'inline-block',
                              boxShadow: `0 0 6px ${item.colorHex}aa`
                            }} />
                          )}
                          <span style={{ color: 'var(--gold-primary)', fontWeight: 700, fontSize: '0.7rem' }}>
                            {item.color}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Barra de Ações: Recortar e Reordenar */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setCropImageSrc(item.preview);
                          setCurrentCropTargetId(item.id);
                        }}
                        className="btn-secondary"
                        style={{
                          flex: 1,
                          padding: '0.45rem',
                          fontSize: '0.78rem',
                          background: 'rgba(59, 130, 246, 0.15)',
                          borderColor: 'rgba(59, 130, 246, 0.4)',
                          color: '#60a5fa',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          borderRadius: '6px'
                        }}
                        title="Recortar imagem para dimensões ideais"
                      >
                        <span>✂️</span> Recortar
                      </button>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => moveImage(index, "up")}
                          disabled={index === 0}
                          className="btn-secondary"
                          style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: index === 0 ? 0.25 : 1,
                            borderRadius: '6px'
                          }}
                          title="Mover para a esquerda"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, "down")}
                          disabled={index === imagesList.length - 1}
                          className="btn-secondary"
                          style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: index === imagesList.length - 1 ? 0.25 : 1,
                            borderRadius: '6px'
                          }}
                          title="Mover para a direita"
                        >
                          ▶
                        </button>
                      </div>
                    </div>

                    {/* Vínculo de Cor com Amostra e Pincel */}
                    <div style={{
                      background: 'rgba(0,0,0,0.35)',
                      borderRadius: '8px',
                      border: '1px solid rgba(212, 175, 55, 0.18)',
                      padding: '0.65rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>🎨</span> Cor da Foto:
                        </span>
                        {item.colorHex && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {item.colorHex}
                          </span>
                        )}
                      </div>

                      {/* Seletor + Amostra */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {item.colorHex ? (
                          <span
                            title={`Amostra de cor: ${item.colorHex}`}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: item.colorHex,
                              border: '2px solid #fff',
                              flexShrink: 0,
                              boxShadow: `0 0 8px ${item.colorHex}88`
                            }}
                          />
                        ) : (
                          <span
                            title="Sem cor identificada"
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px dashed rgba(255,255,255,0.25)',
                              flexShrink: 0
                            }}
                          />
                        )}

                        <select
                          value={item.color || ""}
                          onChange={(e) => updateImageColor(item.id, e.target.value)}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            fontSize: '0.76rem',
                            borderRadius: '6px',
                            background: '#111',
                            color: '#fff',
                            border: item.color ? '1px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.12)',
                            minWidth: 0
                          }}
                        >
                          <option value="">(Nenhuma / Foto Geral)</option>
                          {colors.map((c) => (
                            <option key={c} value={c}>Cor: {c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Botão de Pincel com Amostra */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setEyedropperTarget(item)}
                          className="btn-primary"
                          style={{
                            flex: 1,
                            padding: '0.45rem',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(170, 124, 17, 0.25) 100%)',
                            border: '1px solid var(--gold-primary)',
                            color: '#fff'
                          }}
                          title="Extrair a cor real do produto com o pincel"
                        >
                          <span>🖌️</span> {item.colorHex ? "Recapturar com Pincel" : "Pegar Cor com Pincel"}
                        </button>

                        {item.colorHex && (
                          <button
                            type="button"
                            onClick={() => {
                              setImagesList((prev) =>
                                prev.map((img) => img.id === item.id ? { ...img, colorHex: undefined } : img)
                              );
                            }}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              borderRadius: '6px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#aaa',
                              cursor: 'pointer'
                            }}
                            title="Remover amostra de cor"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={loading || !formData.categoryId}>
              {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Produto"}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h2>Produtos Cadastrados ({products.length})</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome & Variações</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Promoção</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => {
                const photosCount = prod.images?.length || [prod.imageUrl, prod.imageUrl2, prod.imageUrl3].filter(Boolean).length;
                return (
                  <tr key={prod.id} style={{ opacity: prod.isVisible === false ? 0.6 : 1 }}>
                    <td>
                      {prod.imageUrl ? (
                        <div style={{ position: 'relative', width: '45px', height: '45px' }}>
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--glass-border)' }}
                          />
                          {photosCount > 1 && (
                            <span style={{
                              position: 'absolute',
                              bottom: '-4px',
                              right: '-4px',
                              background: '#000',
                              color: 'var(--gold-primary)',
                              fontSize: '0.65rem',
                              padding: '1px 4px',
                              borderRadius: '4px',
                              border: '1px solid var(--gold-primary)',
                              fontWeight: 'bold'
                            }}>
                              +{photosCount - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{ width: '45px', height: '45px', background: 'var(--glass-bg)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                          Sem foto
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {prod.name}
                        {prod.isVisible === false && (
                          <span style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', background: '#333', borderRadius: '4px' }}>
                            Oculto
                          </span>
                        )}
                      </div>

                      {/* Badges de Cores com Amostra Visual */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {prod.colors && prod.colors.length > 0 && prod.colors.map((c, i) => {
                          const matchedHex = Array.isArray(prod.variantImages)
                            ? prod.variantImages.find((vi: any) => vi.color === c)?.colorHex
                            : undefined;
                          return (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                background: 'rgba(212,175,55,0.12)',
                                color: '#fff',
                                borderRadius: '12px',
                                border: '1px solid rgba(212,175,55,0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              {matchedHex ? (
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: matchedHex, border: '1px solid #fff', display: 'inline-block' }} />
                              ) : (
                                <span>🎨</span>
                              )}
                              <span>{c}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>{prod.category?.name || "Sem categoria"}</td>
                    <td>{formatCurrency(prod.price)}</td>
                    <td className="gold-text">
                      {prod.promotionalPrice ? formatCurrency(prod.promotionalPrice) : "-"}
                      {prod.isPromotion && <span style={{ marginLeft: '8px' }}>⭐</span>}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button onClick={() => handleEdit(prod)} className={`${styles.actionBtn} ${styles.actionBtnEdit}`}>
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleDelete(prod.id)} className={`${styles.actionBtn} ${styles.actionBtnDelete}`}>
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
