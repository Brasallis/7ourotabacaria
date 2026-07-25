"use client";

import { useState, useEffect } from "react";
import styles from "../layout.module.css";

type Category = {
  id: string;
  name: string;
};

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>
                  <div className={styles.actionButtons}>
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
    </div>
  );
}
