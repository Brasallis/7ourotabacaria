"use client";

import { useState, useEffect } from "react";
import styles from "../layout.module.css";

type PromoCode = {
  id: string;
  code: string;
  discountPercentage: number;
  active: boolean;
};

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
  });

  const fetchCoupons = async () => {
    const res = await fetch("/api/cupons");
    if (res.ok) setCoupons(await res.json());
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch("/api/cupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ code: "", discountPercentage: "" });
      fetchCoupons();
    } else {
      const error = await res.json();
      alert(error.error || "Erro ao criar cupom");
    }
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await fetch(`/api/cupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentStatus }),
    });
    if (res.ok) fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;
    const res = await fetch(`/api/cupons/${id}`, { method: "DELETE" });
    if (res.ok) fetchCoupons();
  };

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
        Gerenciar <span className="gold-text">Cupons</span>
      </h1>

      <form className={styles.adminForm} onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div className={styles.formGroup}>
          <label>Código do Cupom</label>
          <input 
            type="text" 
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
            placeholder="Ex: PRIMEIRA10, OURO20"
            required 
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Desconto (%)</label>
          <input 
            type="number" 
            value={formData.discountPercentage}
            onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
            placeholder="Ex: 10"
            min="1"
            max="100"
            required 
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Criando..." : "Criar Cupom"}
        </button>
      </form>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h2>Cupons Existentes</h2>
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Desconto</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} style={{ opacity: coupon.active ? 1 : 0.5 }}>
                  <td style={{ fontWeight: 'bold' }}>{coupon.code}</td>
                  <td className="gold-text">{coupon.discountPercentage}% OFF</td>
                  <td>
                    <button 
                      onClick={() => toggleStatus(coupon.id, coupon.active)}
                      style={{ 
                        background: coupon.active ? 'var(--gold-gradient)' : '#333', 
                        color: coupon.active ? '#000' : '#fff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button onClick={() => handleDelete(coupon.id)} className={`${styles.actionBtn} ${styles.actionBtnDelete}`}>
                        🗑️ Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', opacity: 0.5 }}>
                    Nenhum cupom criado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
