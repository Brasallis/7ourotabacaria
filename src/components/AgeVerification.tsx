"use client";

import { useState, useEffect } from "react";
import styles from "../app/page.module.css"; // Reuse some global styles

export default function AgeVerification() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const verified = localStorage.getItem("7ouro_age_verified");
    if (verified === "true") {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  }, []);

  const handleVerify = (isAdult: boolean) => {
    if (isAdult) {
      localStorage.setItem("7ouro_age_verified", "true");
      setIsVerified(true);
    } else {
      window.location.href = "https://www.google.com"; // Redirect minors away
    }
  };

  if (isVerified === null || isVerified === true) {
    return null; // Don't render if verified or loading
  }

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.95)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass-panel" style={{
        maxWidth: "500px",
        padding: "3rem 2rem",
        textAlign: "center",
        border: "1px solid var(--gold-primary)"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔞</div>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Você tem mais de 18 anos?</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.5 }}>
          A <b>7 Ouro Tabacaria</b> vende produtos restritos. Para acessar nosso catálogo e realizar compras, você precisa confirmar que é maior de idade.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button className="btn-secondary" onClick={() => handleVerify(false)} style={{ flex: 1 }}>
            Não, sou menor
          </button>
          <button className="btn-primary" onClick={() => handleVerify(true)} style={{ flex: 1 }}>
            Sim, tenho +18
          </button>
        </div>
      </div>
    </div>
  );
}
