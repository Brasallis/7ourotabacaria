"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao fazer login");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
    
    setLoading(false);
  };

  return (
    <main className={styles.main} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem', textAlign: 'center' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Image 
            src="/logo.jpg" 
            alt="Logo 7 Ouro" 
            width={80} 
            height={80} 
            style={{ borderRadius: '50%', border: '2px solid var(--gold-primary)' }}
          />
        </div>
        
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Acesso Restrito</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Área Administrativa - <span className="gold-text">7 OURO</span></p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <input 
              type="password" 
              placeholder="Digite a Senha Mestra"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                fontSize: '1rem'
              }}
            />
          </div>

          {error && <p style={{ color: '#ff4d4f', fontSize: '0.9rem', margin: '0' }}>{error}</p>}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ marginTop: '1rem', padding: '1rem' }}
          >
            {loading ? "Entrando..." : "Acessar Painel"}
          </button>
        </form>

        <div style={{ marginTop: '2rem' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'underline' }}>
            Voltar para a loja
          </Link>
        </div>
      </div>
    </main>
  );
}
