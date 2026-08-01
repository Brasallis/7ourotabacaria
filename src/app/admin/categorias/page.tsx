"use client";

import { useState, useEffect } from "react";
import styles from "../layout.module.css";

type Category = {
  id: string;
  name: string;
  products?: any[];
};

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      setCategories(await res.json());
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      setName("");
      setEditingId(null);
      fetchCategories();
    } else {
      alert("Erro ao salvar categoria");
    }
    
    setLoading(false);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? TODOS os produtos dentro dela também serão excluídos!")) return;
    
    setLoading(true);
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchCategories();
    } else {
      alert("Erro ao excluir");
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
        Gerenciar <span className="gold-text">Categorias</span>
      </h1>

      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Nome da Categoria</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="Ex: Essências, Carvão, Narguilé"
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Categoria"}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setName(""); }}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2>Categorias Cadastradas</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Qtd. Produtos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>{cat.products?.length || 0} produto(s)</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      onClick={() => setViewingCategory(cat)} 
                      className={`${styles.actionBtn}`}
                      style={{ background: 'var(--glass-bg)', color: '#fff' }}
                    >
                      👀 Ver
                    </button>
                    <button 
                      onClick={() => handleEdit(cat)} 
                      className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)} 
                      className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {viewingCategory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', padding: '2rem', position: 'relative', background: 'rgba(15, 15, 15, 0.98)' }}>
            <button 
              onClick={() => setViewingCategory(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>
              Produtos na Categoria: <span className="gold-text">{viewingCategory.name}</span>
            </h2>
            
            {(!viewingCategory.products || viewingCategory.products.length === 0) ? (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum produto cadastrado nesta categoria.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {viewingCategory.products.map(prod => (
                  <li key={prod.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{prod.name}</span>
                    <span className="gold-text">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.promotionalPrice || prod.price)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
