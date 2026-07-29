"use client";

import { useState, useEffect } from "react";
import styles from "../layout.module.css";

type Category = {
  id: string;
  name: string;
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
  isPromotion: boolean;
  isVisible: boolean;
  category: Category;
  categoryId: string;
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
  
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);
  
  const [existingImageUrl1, setExistingImageUrl1] = useState("");
  const [existingImageUrl2, setExistingImageUrl2] = useState("");
  const [existingImageUrl3, setExistingImageUrl3] = useState("");

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
    
    let uploadedImageUrl1 = existingImageUrl1;
    let uploadedImageUrl2 = existingImageUrl2;
    let uploadedImageUrl3 = existingImageUrl3;

    if (file1) {
      const url = await uploadSingleFile(file1);
      if (url) uploadedImageUrl1 = url;
    }
    if (file2) {
      const url = await uploadSingleFile(file2);
      if (url) uploadedImageUrl2 = url;
    }
    if (file3) {
      const url = await uploadSingleFile(file3);
      if (url) uploadedImageUrl3 = url;
    }
    
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/products/${editingId}` : "/api/products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...formData, 
        imageUrl: uploadedImageUrl1,
        imageUrl2: uploadedImageUrl2,
        imageUrl3: uploadedImageUrl3
      }),
    });

    if (res.ok) {
      handleCancel();
      fetchData();
    } else {
      alert("Erro ao salvar produto");
    }
    
    setLoading(false);
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
    setExistingImageUrl1(prod.imageUrl || "");
    setExistingImageUrl2(prod.imageUrl2 || "");
    setExistingImageUrl3(prod.imageUrl3 || "");
    setFile1(null);
    setFile2(null);
    setFile3(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({ name: "", description: "", price: "", promotionalPrice: "", categoryId: "", isPromotion: false, isVisible: true });
    setExistingImageUrl1("");
    setExistingImageUrl2("");
    setExistingImageUrl3("");
    setFile1(null);
    setFile2(null);
    setFile3(null);
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
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Preço Original (R$)</label>
            <input 
              type="text" 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: formatCurrencyInput(e.target.value)})}
              placeholder="0,00"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label style={{ color: 'var(--gold-light)' }}>Preço Promocional (Opcional)</label>
            <input 
              type="text" 
              value={formData.promotionalPrice}
              onChange={(e) => setFormData({...formData, promotionalPrice: formatCurrencyInput(e.target.value)})}
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
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required 
            rows={3}
          />
        </div>

        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label>Categoria</label>
            <select 
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              required
              style={{ width: '100%' }}
            >
              <option value="">Selecione uma categoria...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input 
              type="checkbox" 
              id="isPromotion"
              checked={formData.isPromotion}
              onChange={(e) => setFormData({...formData, isPromotion: e.target.checked})}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label htmlFor="isPromotion" style={{ margin: 0, cursor: 'pointer', color: 'var(--gold-primary)' }}>
              ⭐ Destacar na Vitrine (Página Inicial)
            </label>
          </div>
          
          <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input 
              type="checkbox" 
              id="isVisible"
              checked={formData.isVisible}
              onChange={(e) => setFormData({...formData, isVisible: e.target.checked})}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label htmlFor="isVisible" style={{ margin: 0, cursor: 'pointer', color: formData.isVisible ? '#4CAF50' : 'var(--text-secondary)' }}>
              👁️ {formData.isVisible ? "Exibindo na Loja" : "Oculto na Loja"}
            </label>
          </div>
        </div>

        <div className={styles.grid3}>
          <div className={styles.formGroup}>
            <label>Foto Principal</label>
            {(existingImageUrl1 || file1) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <img 
                  src={file1 ? URL.createObjectURL(file1) : existingImageUrl1} 
                  alt="Preview" 
                  style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '4px', background: '#000' }} 
                />
                <button 
                  type="button"
                  onClick={() => { setExistingImageUrl1(""); setFile1(null); }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.5rem', background: '#d93025', color: '#fff', border: 'none' }}
                >🗑️ Remover Foto Principal</button>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile1(e.target.files?.[0] || null)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Foto Secundária (2)</label>
            {(existingImageUrl2 || file2) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <img 
                  src={file2 ? URL.createObjectURL(file2) : existingImageUrl2} 
                  alt="Preview" 
                  style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '4px', background: '#000' }} 
                />
                <button 
                  type="button"
                  onClick={() => { setExistingImageUrl2(""); setFile2(null); }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.5rem', background: '#d93025', color: '#fff', border: 'none' }}
                >🗑️ Remover Foto 2</button>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile2(e.target.files?.[0] || null)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Foto Secundária (3)</label>
            {(existingImageUrl3 || file3) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <img 
                  src={file3 ? URL.createObjectURL(file3) : existingImageUrl3} 
                  alt="Preview" 
                  style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '4px', background: '#000' }} 
                />
                <button 
                  type="button"
                  onClick={() => { setExistingImageUrl3(""); setFile3(null); }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.5rem', background: '#d93025', color: '#fff', border: 'none' }}
                >🗑️ Remover Foto 3</button>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile3(e.target.files?.[0] || null)}
            />
          </div>
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
        <h2>Produtos Cadastrados</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Promoção</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ opacity: prod.isVisible === false ? 0.6 : 1 }}>
                  <td>
                    {prod.imageUrl ? (
                      <img src={prod.imageUrl} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: 'var(--glass-bg)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Sem foto</div>
                    )}
                  </td>
                  <td>
                    {prod.name} 
                    {prod.isVisible === false && <span style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', background: '#333', borderRadius: '4px' }}>Oculto</span>}
                  </td>
                  <td>{prod.category?.name || "Sem categoria"}</td>
                  <td>{formatCurrency(prod.price)}</td>
                  <td className="gold-text">
                    {prod.promotionalPrice ? formatCurrency(prod.promotionalPrice) : "-"}
                    {prod.isPromotion && <span style={{ marginLeft: '8px' }}>⭐</span>}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button onClick={() => handleEdit(prod)} className={`${styles.actionBtn} ${styles.actionBtnEdit}`}>✏️ Editar</button>
                      <button onClick={() => handleDelete(prod.id)} className={`${styles.actionBtn} ${styles.actionBtnDelete}`}>🗑️ Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
