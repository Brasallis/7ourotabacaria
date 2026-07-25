"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const accepted = localStorage.getItem("7ouro_cookies");
    if (accepted === "true") {
      setHasAccepted(true);
    } else {
      setHasAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("7ouro_cookies", "true");
    setHasAccepted(true);
  };

  const handleDecline = () => {
    localStorage.setItem("7ouro_cookies", "false");
    setHasAccepted(true); // Hide banner regardless
  };

  if (hasAccepted === null || hasAccepted === true) {
    return null;
  }

  return (
    <div className="glass-panel" style={{
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "90%",
      maxWidth: "600px",
      zIndex: 9998,
      padding: "1.5rem",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1.5rem",
      border: "1px solid var(--glass-border)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.8)"
    }}>
      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
        Utilizamos cookies para melhorar sua experiência de navegação e salvar os itens do seu carrinho. Ao continuar, você concorda com nossa política.
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button className="btn-secondary" onClick={handleDecline} style={{ padding: "8px 16px", whiteSpace: "nowrap", fontSize: "0.9rem" }}>
          Recusar
        </button>
        <button className="btn-primary" onClick={handleAccept} style={{ padding: "8px 16px", whiteSpace: "nowrap", fontSize: "0.9rem" }}>
          Aceitar
        </button>
      </div>
    </div>
  );
}
